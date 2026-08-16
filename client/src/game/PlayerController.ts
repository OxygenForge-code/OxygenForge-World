/**
 * OxygenForge World style: deliberate first-person exploration with direct touch
 * camera control and a restrained mobile movement pace.
 */

import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import { GameWorld } from "./GameWorld";
import { InputManager } from "./InputManager";

export class PlayerController {
  readonly camera: UniversalCamera;
  private yaw = 0.6;
  private pitch = -0.12;
  private verticalVelocity = 0;
  private autopilotTime = 0;
  private demoInitialized = false;

  constructor(scene: Scene, private readonly world: GameWorld, private readonly input: InputManager) {
    const surface = world.getSurfaceY(10, 10);
    this.camera = new UniversalCamera("field-camera", new Vector3(10.5, surface + 1.65, 10.5), scene);
    this.camera.minZ = 0.04;
    this.camera.fov = 0.94;
    this.applyViewTarget();
  }

  update(delta: number, demo: boolean) {
    const look = this.input.takeLook();
    const movement = this.input.movement();
    let moveX = movement.x;
    let moveY = movement.y;

    if (demo) {
      if (!this.demoInitialized) {
        this.demoInitialized = true;
        this.camera.position.set(13.5, 14.5, 13.5);
        this.yaw = -2.35;
        this.pitch = -0.84;
      }
      this.autopilotTime += delta;
      moveX = Math.sin(this.autopilotTime * 0.4) * 0.12;
      moveY = 0.15;
      this.yaw += delta * 0.06;
      this.pitch = -0.84 + Math.sin(this.autopilotTime * 0.6) * 0.025;
    } else {
      // Finger movement follows the camera: drag left looks left, drag right looks right.
      this.yaw += look.x * 0.0064;
      this.pitch = Math.max(-1.2, Math.min(1.1, this.pitch - look.y * 0.0054));
    }

    const forward = new Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    const right = new Vector3(forward.z, 0, -forward.x);
    const speed = 4.7;
    const displacement = forward.scale(moveY * speed * delta).add(right.scale(moveX * speed * delta));
    this.camera.position.addInPlace(displacement);
    this.world.clampPosition(this.camera.position);

    if (!demo) {
      const ground = this.world.getSurfaceY(this.camera.position.x, this.camera.position.z);
      const grounded = this.camera.position.y <= ground + 1.66;
      if (this.input.takeJump() && grounded) this.verticalVelocity = 5.4;
      this.verticalVelocity -= 14.5 * delta;
      this.camera.position.y += this.verticalVelocity * delta;
      if (this.camera.position.y < ground + 1.66) {
        this.camera.position.y = ground + 1.66;
        this.verticalVelocity = 0;
      }
    }

    this.applyViewTarget();
  }

  private applyViewTarget() {
    const horizontal = Math.cos(this.pitch);
    const target = this.camera.position.add(new Vector3(
      Math.sin(this.yaw) * horizontal,
      Math.sin(this.pitch),
      Math.cos(this.yaw) * horizontal,
    ));
    this.camera.setTarget(target);
  }
}
