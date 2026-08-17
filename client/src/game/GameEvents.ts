/**
 * OxygenForge World style: Jeolojik Sefer Günlüğü — the React shell receives only
 * focused HUD events; all gameplay ownership stays inside the Babylon modules.
 */

export type BlockType = "air" | "soil" | "grass" | "basalt" | "sandstone" | "copper" | "wood" | "torch";

export interface InventorySlot {
  type: Exclude<BlockType, "air">;
  amount: number;
  label: string;
  tint: string;
}

export interface HudSnapshot {
  health: number;
  energy: number;
  day: number;
  coords: string;
  biome: string;
  target: string;
  note: string;
  selected: number;
  inventory: InventorySlot[];
}

export interface RuntimeSettings {
  fov?: number;
  sensitivity?: number;
  renderScale?: number;
  fpsLimit?: number;
  viewDistance?: number;
}

export type InputMessage =
  | { kind: "move"; x: number; y: number }
  | { kind: "look"; x: number; y: number }
  | { kind: "action"; action: "break" | "place" | "jump" | "start" }
  | { kind: "select"; index: number }
  | { kind: "settings"; settings: RuntimeSettings };

export const INPUT_EVENT = "oxygenforge:input";
export const HUD_EVENT = "oxygenforge:hud";

export function emitHud(snapshot: HudSnapshot) {
  window.dispatchEvent(new CustomEvent<HudSnapshot>(HUD_EVENT, { detail: snapshot }));
}

export function sendInput(message: InputMessage) {
  window.dispatchEvent(new CustomEvent<InputMessage>(INPUT_EVENT, { detail: message }));
}
