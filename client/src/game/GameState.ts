/**
 * OxygenForge World style: tangible materials and concise field telemetry; this
 * class owns player resources, while rendering remains in GameWorld.
 */

import { type BlockType, type HudSnapshot, type InventorySlot, emitHud } from "./GameEvents";

const BASE_SLOTS: InventorySlot[] = [
  { type: "soil", amount: 18, label: "Toprak", tint: "#9b5d3b" },
  { type: "basalt", amount: 12, label: "Bazalt", tint: "#383634" },
  { type: "sandstone", amount: 9, label: "Kumtaşı", tint: "#c99a61" },
  { type: "wood", amount: 7, label: "Kütük", tint: "#785035" },
  { type: "torch", amount: 3, label: "Meşale", tint: "#e8a84a" },
  { type: "copper", amount: 0, label: "Bakır", tint: "#b86032" },
];

export class GameState {
  private inventory = BASE_SLOTS.map((slot) => ({ ...slot }));
  private selected = 0;
  private health = 5;
  private energy = 88;
  private day = 3;
  private note = "Kuzey yamacında oksit bakırı aranıyor.";
  private target = "Arazi taranıyor";
  private x = 0;
  private y = 0;
  private z = 0;
  private elapsed = 0;
  private lastEmit = -1;

  setPosition(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  setTarget(type: BlockType | null) {
    this.target = type && type !== "air" ? this.blockLabel(type) : "Hedef yok";
  }

  setSelected(index: number) {
    if (index < 0 || index >= this.inventory.length) return;
    this.selected = index;
    this.note = `${this.inventory[index].label} hazır.`;
    this.emit(true);
  }

  addBlock(type: Exclude<BlockType, "air">) {
    const slot = this.inventory.find((item) => item.type === type);
    if (slot) slot.amount += 1;
    if (type === "copper") this.note = "Bakır örneği kaydedildi. Üretim tezgâhı için yeterli.";
    else this.note = `${this.blockLabel(type)} envantere alındı; saha kaydı güncellendi.`;
    this.energy = Math.max(0, this.energy - 1);
    this.emit(true);
  }

  consumeSelected(): Exclude<BlockType, "air"> | null {
    const slot = this.inventory[this.selected];
    if (!slot || slot.amount <= 0) {
      this.note = "Bu malzeme için stok yok.";
      this.emit(true);
      return null;
    }
    slot.amount -= 1;
    this.note = `${slot.label} araziye yerleştirildi; saha kaydı güncellendi.`;
    this.energy = Math.max(0, this.energy - 0.3);
    this.emit(true);
    return slot.type;
  }

  tick(delta: number) {
    this.elapsed += delta;
    this.energy = Math.min(100, this.energy + delta * 0.07);
    this.emit(false);
  }

  private emit(force: boolean) {
    if (!force && this.elapsed - this.lastEmit < 0.22) return;
    this.lastEmit = this.elapsed;
    const snapshot: HudSnapshot = {
      health: this.health,
      energy: Math.round(this.energy),
      day: this.day,
      coords: `${Math.round(this.x)} / ${Math.round(this.y)} / ${Math.round(this.z)}`,
      biome: "BAZALT YAYLASI",
      target: this.target.toUpperCase(),
      note: this.note,
      selected: this.selected,
      inventory: this.inventory.map((slot) => ({ ...slot })),
    };
    emitHud(snapshot);
  }

  private blockLabel(type: Exclude<BlockType, "air">) {
    return this.inventory.find((item) => item.type === type)?.label ?? type;
  }
}
