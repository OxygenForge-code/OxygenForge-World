/**
 * OxygenForge World style: horizon-first basalt exploration rendered by Babylon;
 * the scene owns 3D state while React only presents the expedition HUD.
 */

import { Engine } from "@babylonjs/core/Engines/engine";
import "@babylonjs/core/Culling/ray";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { GameState } from "./GameState";
import { GameWorld, type VoxelHit } from "./GameWorld";
import { InputManager } from "./InputManager";
import { PlayerController } from "./PlayerController";

export type GameHandle = { scene: Scene; dispose: () => void };

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = Color4.FromHexString("#A8D6D3");
  scene.ambientColor = Color3.FromHexString("#6f746a");

  const sky = new HemisphericLight("sky-light", new Vector3(0.25, 1, -0.2), scene);
  sky.intensity = 1.05;
  sky.groundColor = Color3.FromHexString("#4a382d");
  const sun = new DirectionalLight("mesa-sun", new Vector3(-0.4, -0.72, 0.2), scene);
  sun.position = new Vector3(8, 18, -12);
  sun.intensity = 0.65;

  const world = new GameWorld(scene);
  world.buildInitialTerrain();
  const input = new InputManager(canvas);
  const player = new PlayerController(scene, world, input);
  scene.activeCamera = player.camera;
  const state = new GameState();
  const selection = createSelection(scene);
  const demo = new URLSearchParams(window.location.search).has("demo");
  let currentHit: VoxelHit | null = null;

  scene.onBeforeRenderObservable.add(() => {
    const delta = Math.min(scene.getEngine().getDeltaTime() / 1000, 0.05);
    player.update(delta, demo);
    const selected = input.takeSelected();
    if (selected !== null) state.setSelected(selected);

    currentHit = world.raycast(player.camera.position, player.camera.getForwardRay(1).direction);
    updateSelection(selection, currentHit);
    state.setTarget(currentHit?.type ?? null);

    if (input.takeBreak() && currentHit) {
      const removed = world.remove(currentHit);
      if (removed) state.addBlock(removed);
      currentHit = null;
    }
    if (input.takePlace() && currentHit) {
      const block = state.consumeSelected();
      if (block && !world.place(currentHit, block, player.camera.position)) state.addBlock(block);
    }

    state.setPosition(player.camera.position.x, player.camera.position.y, player.camera.position.z);
    state.tick(delta);
  });

  return {
    scene,
    dispose: () => {
      input.dispose();
      selection.dispose();
      world.dispose();
      scene.dispose();
    },
  };
}

function createSelection(scene: Scene) {
  const selection = MeshBuilder.CreateBox("target-frame", { size: 1.035 }, scene);
  const material = new StandardMaterial("target-frame-material", scene);
  material.wireframe = true;
  material.emissiveColor = Color3.FromHexString("#dca26f");
  material.alpha = 0.86;
  selection.material = material;
  selection.isPickable = false;
  selection.isVisible = false;
  return selection;
}

function updateSelection(selection: ReturnType<typeof createSelection>, hit: VoxelHit | null) {
  selection.isVisible = Boolean(hit);
  if (!hit) return;
  selection.position.set(hit.x + 0.5, hit.y + 0.5, hit.z + 0.5);
}
