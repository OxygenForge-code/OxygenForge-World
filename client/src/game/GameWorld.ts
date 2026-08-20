/**
 * OxygenForge World style: a mobile field journal over an endless, layered
 * basalt expedition. Chunks are deterministic, loaded around the player, and
 * rebuilt into one material mesh per block type for a restrained memory budget.
 */

import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import type { Scene } from "@babylonjs/core/scene";
import { type BlockType } from "./GameEvents";

type SolidBlock = Exclude<BlockType, "air">;
type Face = { direction: [number, number, number]; corners: [number, number, number][] };
type MeshData = { positions: number[]; normals: number[]; indices: number[]; uvs: number[] };

const CHUNK_SIZE = 12;
const DEFAULT_ACTIVE_RADIUS = 2;
const MAX_HEIGHT = 12;
const WORLD_SEED = 734_291;
const SAVE_KEY = "oxygenforge-world-edits-v2";
const TEXTURE_FACE_SCALE = 0.45;
const MOBILE_ANISOTROPY = 4;
// All texture bytes are bundled under client/public/textures and copied by Capacitor into the APK.
const USE_LOCAL_TEXTURES = true;

const FACES: Face[] = [
  { direction: [0, 0, -1], corners: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]] },
  { direction: [0, 0, 1], corners: [[1, 0, 1], [0, 0, 1], [0, 1, 1], [1, 1, 1]] },
  { direction: [-1, 0, 0], corners: [[0, 0, 1], [0, 0, 0], [0, 1, 0], [0, 1, 1]] },
  { direction: [1, 0, 0], corners: [[1, 0, 0], [1, 0, 1], [1, 1, 1], [1, 1, 0]] },
  { direction: [0, -1, 0], corners: [[0, 0, 1], [1, 0, 1], [1, 0, 0], [0, 0, 0]] },
  { direction: [0, 1, 0], corners: [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]] },
];

const TEXTURES: Partial<Record<SolidBlock, string>> = {
  soil: "textures/soil.png",
  grass: "textures/grass.png",
  basalt: "textures/basalt.png",
  sandstone: "textures/sandstone.png",
  copper: "textures/copper.png",
  wood: "textures/wood.png",
  torch: "textures/torch.png",
};

const COLORS: Record<SolidBlock, string> = {
  soil: "#8e4d32",
  grass: "#789653",
  basalt: "#46505a",
  sandstone: "#d7aa64",
  copper: "#d57938",
  wood: "#8d5233",
  torch: "#ffb644",
};

function blockKey(x: number, y: number, z: number) {
  return `${x}:${y}:${z}`;
}

function chunkKey(cx: number, cz: number) {
  return `${cx}:${cz}`;
}

function floorDiv(value: number, divisor: number) {
  return Math.floor(value / divisor);
}

function seededNoise(x: number, z: number) {
  const value = Math.sin((x + WORLD_SEED) * 12.9898 + (z - WORLD_SEED) * 78.233) * 43758.5453;
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
  private readonly activeChunks = new Map<string, { cx: number; cz: number }>();
  private readonly meshes = new Map<SolidBlock, Mesh>();
  private readonly materials = new Map<SolidBlock, StandardMaterial>();
  private activeRadius = DEFAULT_ACTIVE_RADIUS;
  private lastCenterId = "";
  private rebuildQueued = false;

  constructor(private readonly scene: Scene) {
    (Object.keys(COLORS) as SolidBlock[]).forEach((type) => {
      const material = new StandardMaterial(`mat-${type}`, scene);
      const blockColor = Color3.FromHexString(COLORS[type]);
      material.diffuseColor = blockColor;
      material.disableLighting = true;
      material.emissiveColor = blockColor;
      const textureUrl = USE_LOCAL_TEXTURES ? TEXTURES[type] : undefined;
      if (textureUrl) {
        // Mipmaps + trilinear filtering keep distant terrain stable, while a smaller UV scale
        // enlarges the authored texture detail on every cube face.
        const texture = new Texture(textureUrl, scene, false, false, Texture.TRILINEAR_SAMPLINGMODE);
        texture.uScale = TEXTURE_FACE_SCALE;
        texture.vScale = TEXTURE_FACE_SCALE;
        texture.wrapU = Texture.WRAP_ADDRESSMODE;
        texture.wrapV = Texture.WRAP_ADDRESSMODE;
        texture.anisotropicFilteringLevel = MOBILE_ANISOTROPY;
        material.diffuseTexture = texture;
        material.emissiveTexture = texture;
        // Keep mobile WebGL texture rendering stable on devices with limited shader support.
        material.emissiveColor = Color3.White();
      }
      material.specularColor = Color3.Black();
      material.ambientColor = Color3.FromHexString("#2b2522");

      this.materials.set(type, material);
    });
  }

  buildInitialTerrain(position = new Vector3(10.5, 0, 10.5)) {
    this.loadEdits();
    this.updateAround(position);
  }

  updateAround(position: Vector3) {
    const centerX = floorDiv(Math.floor(position.x), CHUNK_SIZE);
    const centerZ = floorDiv(Math.floor(position.z), CHUNK_SIZE);
    const centerId = chunkKey(centerX, centerZ);
    if (centerId === this.lastCenterId) return;
    this.lastCenterId = centerId;
    const desired = new Set<string>();

    let changed = false;
    for (let dx = -this.activeRadius; dx <= this.activeRadius; dx += 1) {
      for (let dz = -this.activeRadius; dz <= this.activeRadius; dz += 1) {
        const cx = centerX + dx;
        const cz = centerZ + dz;
        const id = chunkKey(cx, cz);
        desired.add(id);
        if (this.ensureChunk(cx, cz)) changed = true;
      }
    }


    this.activeChunks.forEach(({ cx, cz }, id) => {
      if (desired.has(id)) return;
      this.unloadChunk(cx, cz);
      this.activeChunks.delete(id);
      changed = true;
    });

    if (changed) this.queueMeshRebuild();
  }

  setViewDistance(radius: number) {
    const next = Math.max(1, Math.min(2, Math.round(radius)));
    if (next === this.activeRadius) return;
    this.activeRadius = next;
    this.lastCenterId = "";
  }

  getBlock(x: number, y: number, z: number): BlockType {
    return this.blocks.get(blockKey(x, y, z)) ?? "air";
  }

  getSurfaceY(x: number, z: number) {
    const blockX = Math.floor(x);
    const blockZ = Math.floor(z);
    this.ensureChunk(floorDiv(blockX, CHUNK_SIZE), floorDiv(blockZ, CHUNK_SIZE));
    for (let y = MAX_HEIGHT; y >= 0; y -= 1) {
      if (this.getBlock(blockX, y, blockZ) !== "air") return y + 1;
    }
    return 1;
  }

  clampPosition(_position: Vector3) {
    // Infinite world: movement is not clamped at a world edge.
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
    this.blocks.delete(blockKey(hit.x, hit.y, hit.z));
    this.rememberEdit(blockKey(hit.x, hit.y, hit.z), "air");
    this.queueMeshRebuild();
    return type as SolidBlock;
  }

  place(hit: VoxelHit, type: SolidBlock, playerPosition: Vector3) {
    const x = hit.x + Math.round(hit.normal.x);
    const y = hit.y + Math.round(hit.normal.y);
    const z = hit.z + Math.round(hit.normal.z);
    this.ensureChunk(floorDiv(x, CHUNK_SIZE), floorDiv(z, CHUNK_SIZE));
    if (y < 0 || y > MAX_HEIGHT || this.getBlock(x, y, z) !== "air") return false;
    if (Math.abs(playerPosition.x - (x + 0.5)) < 0.75 && Math.abs(playerPosition.z - (z + 0.5)) < 0.75) return false;
    this.blocks.set(blockKey(x, y, z), type);
    this.rememberEdit(blockKey(x, y, z), type);
    this.queueMeshRebuild();
    return true;
  }

  dispose() {
    this.meshes.forEach((mesh) => mesh.dispose());
    this.materials.forEach((material) => material.dispose());
    this.activeChunks.clear();
    this.blocks.clear();
  }

  private ensureChunk(cx: number, cz: number) {
    const id = chunkKey(cx, cz);
    if (this.activeChunks.has(id)) return false;

    for (let lx = 0; lx < CHUNK_SIZE; lx += 1) {
      for (let lz = 0; lz < CHUNK_SIZE; lz += 1) {
        const x = cx * CHUNK_SIZE + lx;
        const z = cz * CHUNK_SIZE + lz;
        const surface = this.terrainHeight(x, z);
        for (let y = 0; y <= surface; y += 1) {
          let type: SolidBlock = "basalt";
          if (y === surface) type = surface > 7 ? "grass" : "sandstone";
          else if (y >= surface - 1) type = surface > 7 ? "soil" : "sandstone";
          else if (seededNoise(x * 2 + y, z * 3 - y) > 0.945) type = "copper";
          this.blocks.set(blockKey(x, y, z), type);
        }
      }
    }

    this.applySavedEdits(cx, cz);
    this.activeChunks.set(id, { cx, cz });
    return true;
  }

  private unloadChunk(cx: number, cz: number) {
    const minX = cx * CHUNK_SIZE;
    const minZ = cz * CHUNK_SIZE;
    this.blocks.forEach((_type, id) => {
      const [x, _y, z] = id.split(":").map(Number);
      if (x >= minX && x < minX + CHUNK_SIZE && z >= minZ && z < minZ + CHUNK_SIZE) this.blocks.delete(id);
    });
  }

  private terrainHeight(x: number, z: number) {
    const wave = Math.sin(x * 0.27) * 1.6 + Math.cos(z * 0.21) * 1.25 + Math.sin((x + z) * 0.13) * 1.3;
    const broad = Math.sin((x + WORLD_SEED) * 0.018) * 1.7 + Math.cos((z - WORLD_SEED) * 0.016) * 1.4;
    const ridge = Math.max(0, 2.8 - Math.abs(x + 5) * 0.18) + Math.max(0, 1.3 - Math.abs(z + 9) * 0.12);
    return Math.max(3, Math.min(MAX_HEIGHT - 1, Math.floor(5.1 + wave + broad + ridge)));
  }

  private applySavedEdits(cx: number, cz: number) {
    const minX = cx * CHUNK_SIZE;
    const minZ = cz * CHUNK_SIZE;
    this.edits.forEach((type, id) => {
      const [x, _y, z] = id.split(":").map(Number);
      if (x < minX || x >= minX + CHUNK_SIZE || z < minZ || z >= minZ + CHUNK_SIZE) return;
      if (type === "air") this.blocks.delete(id);
      else this.blocks.set(id, type as SolidBlock);
    });
  }

  private queueMeshRebuild() {
    if (this.rebuildQueued) return;
    this.rebuildQueued = true;
    window.requestAnimationFrame(() => {
      this.rebuildQueued = false;
      this.rebuildMeshes();
    });
  }

  private rebuildMeshes() {
    this.meshes.forEach((mesh) => mesh.dispose());
    this.meshes.clear();
    const dataByType = new Map<SolidBlock, MeshData>();
    (Object.keys(COLORS) as SolidBlock[]).forEach((type) => dataByType.set(type, { positions: [], normals: [], indices: [], uvs: [] }));

    this.blocks.forEach((type, id) => {
      const [x, y, z] = id.split(":").map(Number);
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
      Object.entries(saved).forEach(([id, type]) => this.edits.set(id, type));
    } catch {
      window.localStorage.removeItem(SAVE_KEY);
    }
  }

  private rememberEdit(id: string, type: BlockType) {
    this.edits.set(id, type);
    try {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(Object.fromEntries(this.edits)));
    } catch {
      // Storage is optional; world edits remain available during this game session.
    }
  }
}
