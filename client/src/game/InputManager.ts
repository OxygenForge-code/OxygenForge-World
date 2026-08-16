/**
 * OxygenForge World style: thumb zones map to semantic actions, never scattered
 * raw key checks, so touch and desktop preview follow the same gameplay contract.
 */

import { INPUT_EVENT, type InputMessage } from "./GameEvents";

export class InputManager {
  private keys = new Set<string>();
  private touchMove = { x: 0, y: 0 };
  private lookDelta = { x: 0, y: 0 };
  private breakQueued = false;
  private placeQueued = false;
  private jumpQueued = false;
  private selected: number | null = null;
  private fov: number | null = null;
  private readonly onKeyDown = (event: KeyboardEvent) => this.keys.add(event.key.toLowerCase());
  private readonly onKeyUp = (event: KeyboardEvent) => this.keys.delete(event.key.toLowerCase());
  private readonly onInput = (event: Event) => {
    const detail = (event as CustomEvent<InputMessage>).detail;
    if (!detail) return;
    if (detail.kind === "move") this.touchMove = { x: detail.x, y: detail.y };
    if (detail.kind === "look") {
      this.lookDelta.x += detail.x;
      this.lookDelta.y += detail.y;
    }
    if (detail.kind === "action") {
      if (detail.action === "break") this.breakQueued = true;
      if (detail.action === "place") this.placeQueued = true;
      if (detail.action === "jump") this.jumpQueued = true;
    }
    if (detail.kind === "select") this.selected = detail.index;
    if (detail.kind === "settings") this.fov = detail.fov;
  };
  private readonly onPointerDown = (event: PointerEvent) => {
    if (event.button === 0) this.breakQueued = true;
    if (event.button === 2) this.placeQueued = true;
  };
  private readonly onContextMenu = (event: Event) => event.preventDefault();

  constructor(private readonly canvas: HTMLCanvasElement) {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener(INPUT_EVENT, this.onInput);
    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("contextmenu", this.onContextMenu);
  }

  movement() {
    const horizontal = (this.keys.has("d") ? 1 : 0) - (this.keys.has("a") ? 1 : 0) + this.touchMove.x;
    const vertical = (this.keys.has("w") ? 1 : 0) - (this.keys.has("s") ? 1 : 0) - this.touchMove.y;
    const length = Math.hypot(horizontal, vertical) || 1;
    return { x: Math.max(-1, Math.min(1, horizontal / length)), y: Math.max(-1, Math.min(1, vertical / length)) };
  }

  takeLook() {
    const result = { ...this.lookDelta };
    this.lookDelta = { x: 0, y: 0 };
    return result;
  }

  takeBreak() {
    const value = this.breakQueued || this.keys.has("f");
    this.breakQueued = false;
    return value;
  }

  takePlace() {
    const value = this.placeQueued || this.keys.has("e");
    this.placeQueued = false;
    return value;
  }

  takeJump() {
    const value = this.jumpQueued || this.keys.has(" ");
    this.jumpQueued = false;
    return value;
  }

  takeSelected() {
    const result = this.selected;
    this.selected = null;
    return result;
  }

  takeFov() {
    const result = this.fov;
    this.fov = null;
    return result;
  }

  dispose() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener(INPUT_EVENT, this.onInput);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("contextmenu", this.onContextMenu);
  }
}
