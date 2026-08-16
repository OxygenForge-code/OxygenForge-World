/**
 * OxygenForge World style: a compact, layered basalt expedition terrain. Meshes
 * are rebuilt only after block edits and contain exposed faces only for mobile.
 */

import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import type { Scene } from "@babylonjs/core/scene";
import { type BlockType } from "./GameEvents";

type SolidBlock = Exclude<BlockType, "air">;
type Face = { direction: [number, number, number]; corners: [number, number, number][] };
type MeshData = { positions: number[]; normals: number[]; indices: number[]; uvs: number[] };

const WORLD_RADIUS = 16;
const MAX_HEIGHT = 12;
const SAVE_KEY = "oxygenforge-world-edits-v1";

const FACES: Face[] = [
  { direction: [0, 0, -1], corners: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]] },
  { direction: [0, 0, 1], corners: [[1, 0, 1], [0, 0, 1], [0, 1, 1], [1, 1, 1]] },
  { direction: [-1, 0, 0], corners: [[0, 0, 1], [0, 0, 0], [0, 1, 0], [0, 1, 1]] },
  { direction: [1, 0, 0], corners: [[1, 0, 0], [1, 0, 1], [1, 1, 1], [1, 1, 0]] },
  { direction: [0, -1, 0], corners: [[0, 0, 1], [1, 0, 1], [1, 0, 0], [0, 0, 0]] },
  { direction: [0, 1, 0], corners: [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]] },
];

const COLORS: Record<SolidBlock, string> = {
  soil: "#9b5d3b",
  grass: "#71834a",
  basalt: "#383634",
  sandstone: "#c69a65",
  copper: "#b86032",
  wood: "#724b34",
  torch: "#e4a34c",
};

function key(x: number, y: number, z: number) {
  return `${x}:${y}:${z}`;
}

function seededNoise(x: number, z: number) {
  const value = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

export interface VoxelHit {
  x: number;
  y: number;
  z: number;
  type: SolidBlock;
  normal: Vector3;
}

export class GameWorld {
  private readonly blocks = new Map<string, SolidBlock>();
  private readonly edits = new Map<string, BlockType>();
  private readonly meshes = new Map<SolidBlock, Mesh>();
  private readonly materials = new Map<SolidBlock, StandardMaterial>();

  constructor(private readonly scene: Scene) {
    (Object.keys(COLORS) as SolidBlock[]).forEach((type) => {
      const material = new StandardMaterial(`mat-${type}`, scene);
      material.diffuseColor = Color3.FromHexString(COLORS[type]);
      material.specularColor = Color3.Black();
      material.ambientColor = Color3.FromHexString("#2b2522");
      material.emissiveColor = type === "copper" ? Color3.FromHexString("#1b0904") : Color3.Black();
      this.materials.set(type, material);
    });
  }

  buildInitialTerrain() {
    for (let x = -WORLD_RADIUS; x <= WORLD_RADIUS; x += 1) {
      for (let z = -WORLD_RADIUS; z <= WORLD_RADIUS; z += 1) {
        const surface = this.terrainHeight(x, z);
        for (let y = 0; y <= surface; y += 1) {
          let type: SolidBlock = "basalt";
          if (y === surface) type = surface > 7 ? "grass" : "sandstone";
          else if (y >= surface - 1) type = surface > 7 ? "soil" : "sandstone";
          if (y < surface - 1 && seededNoise(x * 2 + y, z * 3 - y) > 0.945) type = "copper";
          this.blocks.set(key(x, y, z), type);
        }
      }
    }

    this.addLandmark(-5, 8, -8);
    this.addLandmark(7, 6, 3);
    this.loadEdits();
    this.rebuildMeshes();
  }

  getBlock(x: number, y: number, z: number): BlockType {
    return this.blocks.get(key(x, y, z)) ?? "air";
  }

  getSurfaceY(x: number, z: number) {
    const localX = Math.max(-WORLD_RADIUS, Math.min(WORLD_RADIUS, Math.floor(x)));
    const localZ = Math.max(-WORLD_RADIUS, Math.min(WORLD_RADIUS, Math.floor(z)));
    for (let y = MAX_HEIGHT; y >= 0; y -= 1) {
      if (this.getBlock(localX, y, localZ) !== "air") return y + 1;
    }
    return 1;
  }

  clampPosition(position: Vector3) {
    position.x = Math.max(-WORLD_RADIUS + 1, Math.min(WORLD_RADIUS - 1, position.x));
    position.z = Math.max(-WORLD_RADIUS + 1, Math.min(WORLD_RADIUS - 1, position.z));
  }

  raycast(origin: Vector3, direction: Vector3, maxDistance = 7): VoxelHit | null {
    const step = 0.12;
    let previous = new Vector3(Math.floor(origin.x), Math.floor(origin.y), Math.floor(origin.z));
    for (let distance = 0; distance <= maxDistance; distance += step) {
      const point = origin.add(direction.scale(distance));
      const cell = new Vector3(Math.floor(point.x), Math.floor(point.y), Math.floor(point.z));
      const type = this.getBlock(cell.x, cell.y, cell.z);
      if (type !== "air") {
        const normal = previous.subtract(cell);
        if (normal.lengthSquared() === 0) normal.set(0, 1, 0);
        else normal.normalize();
        return { x: cell.x, y: cell.y, z: cell.z, type, normal };
      }
      previous = cell;
    }
    return null;
  }

  remove(hit: VoxelHit) {
    if (hit.y <= 0) return null;
    const type = this.getBlock(hit.x, hit.y, hit.z);
    if (type === "air") return null;
    this.blocks.delete(key(hit.x, hit.y, hit.z));
    this.rememberEdit(key(hit.x, hit.y, hit.z), "air");
    this.rebuildMeshes();
    return type as SolidBlock;
  }

  place(hit: VoxelHit, type: SolidBlock, playerPosition: Vector3) {
    const x = hit.x + Math.round(hit.normal.x);
    const y = hit.y + Math.round(hit.normal.y);
    const z = hit.z + Math.round(hit.normal.z);
    if (y < 0 || y > MAX_HEIGHT || this.getBlock(x, y, z) !== "air") return false;
    if (Math.abs(playerPosition.x - (x + 0.5)) < 0.75 && Math.abs(playerPosition.z - (z + 0.5)) < 0.75) return false;
    this.blocks.set(key(x, y, z), type);
    this.rememberEdit(key(x, y, z), type);
    this.rebuildMeshes();
    return true;
  }

  dispose() {
    this.meshes.forEach((mesh) => mesh.dispose());
    this.materials.forEach((material) => material.dispose());
  }

  private terrainHeight(x: number, z: number) {
    const wave = Math.sin(x * 0.27) * 1.6 + Math.cos(z * 0.21) * 1.25 + Math.sin((x + z) * 0.13) * 1.3;
    const ridge = Math.max(0, 2.8 - Math.abs(x + 5) * 0.18) + Math.max(0, 1.3 - Math.abs(z + 9) * 0.12);
    return Math.max(3, Math.min(10, Math.floor(5.1 + wave + ridge)));
  }

  private addLandmark(x: number, y: number, z: number) {
    for (let level = 0; level < 4; level += 1) {
      const width = level === 3 ? 0 : 1;
      for (let dx = -width; dx <= width; dx += 1) {
        for (let dz = -width; dz <= width; dz += 1) {
          this.blocks.set(key(x + dx, y + level, z + dz), level === 3 ? "copper" : "basalt");
        }
      }
    }
  }

  private rebuildMeshes() {
    this.meshes.forEach((mesh) => mesh.dispose());
    this.meshes.clear();
    const dataByType = new Map<SolidBlock, MeshData>();
    (Object.keys(COLORS) as SolidBlock[]).forEach((type) => dataByType.set(type, { positions: [], normals: [], indices: [], uvs: [] }));

    this.blocks.forEach((type, blockKey) => {
      const [x, y, z] = blockKey.split(":").map(Number);
      FACES.forEach((face) => {
        const [dx, dy, dz] = face.direction;
        if (this.getBlock(x + dx, y + dy, z + dz) !== "air") return;
        const data = dataByType.get(type)!;
        const offset = data.positions.length / 3;
        face.corners.forEach(([cx, cy, cz], index) => {
          data.positions.push(x + cx, y + cy, z + cz);
          data.normals.push(dx, dy, dz);
          data.uvs.push(index === 1 || index === 2 ? 1 : 0, index >= 2 ? 0 : 1);
        });
        data.indices.push(offset, offset + 1, offset + 2, offset, offset + 2, offset + 3);
      });
    });

    dataByType.forEach((data, type) => {
      if (data.positions.length === 0) return;
      const mesh = new Mesh(`world-${type}`, this.scene);
      const vertexData = new VertexData();
      vertexData.positions = data.positions;
      vertexData.normals = data.normals;
      vertexData.indices = data.indices;
      vertexData.uvs = data.uvs;
      vertexData.applyToMesh(mesh);
      mesh.material = this.materials.get(type)!;
      mesh.isPickable = false;
      this.meshes.set(type, mesh);
    });
  }

  private loadEdits() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY) ?? "{}") as Record<string, BlockType>;
      Object.entries(saved).forEach(([editKey, type]) => {
        if (type === "air") this.blocks.delete(editKey);
        else this.blocks.set(editKey, type as SolidBlock);
        this.edits.set(editKey, type);
      });
    } catch {
      window.localStorage.removeItem(SAVE_KEY);
    }
  }

  private rememberEdit(editKey: string, type: BlockType) {
    this.edits.set(editKey, type);
    try {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(Object.fromEntries(this.edits)));
    } catch {
      // Storage is optional; world edits remain available during this game session.
    }
  }
}
