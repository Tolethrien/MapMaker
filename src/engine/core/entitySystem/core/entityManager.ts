import Tile, { TileTemplate } from "../entities/tile";
import EngineDebugger from "../../modules/debugger";
import Chunk, { ChunkTemplate } from "../entities/chunk";
import Link from "@/utils/link";
import HollowChunk from "../entities/chunkHollow";
import { getAPI } from "@/preload/api/getAPI";
import { sendNotification } from "@/utils/utils";
//TODO: po refactorze znowu notyfikacje trzeba poustawiac w odpowiednim miejscu
//TODO: czegos nie czyścisz jak wczytujesz projekt z juz wczytanego
//TODO: przenies API wczytywania mapy tutaj bo w sumie tym jest
const { readChunk, writeChunk } = getAPI("project");
export default class EntityManager {
  private static loadedChunks: Map<number, Chunk> = new Map();
  private static hollowChunks: Map<number, HollowChunk> = new Map();
  private static chunksToRemove: Set<number> = new Set();
  private static hollowsToRemove: Set<number> = new Set();
  private static chunksToAdd: Set<number> = new Set();
  private static cameraOnChunk: number = 0;
  private static focusedChunk: number | undefined = undefined;
  private static RINGS = 5;

  public static getAllChunks() {
    return this.loadedChunks;
  }
  public static getChunk(index: number) {
    return this.loadedChunks.get(index);
  }
  public static get getCameraOnChunk() {
    return this.cameraOnChunk;
  }

  public static get getFocusedChunk() {
    if (!this.focusedChunk) return;
    return this.loadedChunks.get(this.focusedChunk);
  }
  public static get getFocusedChunkIndex() {
    return this.focusedChunk;
  }
  public static setFocusedChunk(index: number | undefined) {
    this.focusedChunk = index;
  }
  public static updateAll() {
    this.loadedChunks.forEach((chunk) => chunk.update());
    this.hollowChunks.forEach((chunk) => chunk.update());
  }
  public static renderAll() {
    const sorted = Array.from(this.loadedChunks.values()).sort(
      ({ transform: chunkA }, { transform: chunkB }) => {
        if (chunkA.position.y === chunkB.position.y) {
          return chunkA.position.x - chunkB.position.x;
        }
        return chunkA.position.y - chunkB.position.y;
      }
    );
    this.hollowChunks.forEach((chunk) => chunk.render());
    sorted.forEach((chunk) => chunk.render());
  }
  public static clearAll() {
    this.loadedChunks.clear();
    this.hollowChunks.clear();
  }
  public static async frameCleanUp() {
    if (this.chunksToRemove.size === 0 && this.chunksToAdd.size === 0) return;
    this.chunksToRemove.forEach((index) => this.loadedChunks.delete(index));
    this.hollowsToRemove.forEach((index) => this.hollowChunks.delete(index));
    await this.loadChunks();
    this.chunksToRemove.clear();
    this.hollowsToRemove.clear();
  }
  public static async loadChunks() {
    //TODO: change this to own threat and delegating jobs
    const config = Link.get<ProjectConfig>("projectConfig")();
    const hollows = new Set<number>();
    const chunkPromises = Array.from(this.chunksToAdd).map(async (index) => {
      const { data } = await readChunk({
        index,
        projectPath: config.projectPath,
      });
      if (!data) return index;
      return data;
    });
    const results = await Promise.all(chunkPromises);

    results.forEach((res) => {
      if (typeof res === "number") {
        hollows.add(res);
        this.chunksToAdd.delete(res);
      } else {
        EntityManager.populateChunk(res);
        this.chunksToAdd.delete(res.index);
      }
    });
    EntityManager.generateHollows(hollows);
  }
  public static populateChunk(chunkData: ChunkTemplate) {
    const chunk = new Chunk({
      index: chunkData.index,
      position: chunkData.position,
    });
    chunkData.tiles.forEach((tileData, index) => {
      const tilePos = this.getTilePosition(chunkData.position, index);
      const tile = new Tile({
        pos: tilePos,
        chunkIndex: chunkData.index,
        tileIndex: index,
        layers: tileData.layers,
      });
      chunk.addTile(tile);
    });
    this.loadedChunks.set(chunkData.index, chunk);
  }
  public static async createEmptyChunk(chunkIndex: number) {
    const config = Link.get<ProjectConfig>("projectConfig")();
    const numberOfTiles = config.chunkSizeInTiles.w * config.chunkSizeInTiles.h;
    const position = this.getSpiralPositionFromIndex(chunkIndex);
    const chunk = new Chunk({ index: chunkIndex, position });
    Array(numberOfTiles)
      .fill(null)
      .forEach((_, tileIndex) => {
        const tilePos = this.getTilePosition(position, tileIndex);
        const tile = new Tile({
          pos: tilePos,
          chunkIndex: chunkIndex,
          tileIndex: tileIndex,
          layers: [],
        });
        chunk.addTile(tile);
      });
    this.hollowChunks.delete(chunkIndex);
    this.loadedChunks.set(chunkIndex, chunk);

    const ChunkFileStatus = await writeChunk({
      chunk: {
        index: chunkIndex,
        position: { x: position.x, y: position.y },
        tiles: Array.from(chunk.getTiles).map((tile) => {
          return {
            collider: 0,
            index: tile.tileIndex,
            layers: [],
          };
        }),
      },
      projectPath: config.projectPath,
    });
    if (!ChunkFileStatus.success) {
      sendNotification({
        type: "error",
        value: `error writing empty chunk ${chunkIndex}`,
      });
      return ChunkFileStatus;
    }
    return { error: "", success: true };
  }
  public static async saveOnChange(chunkIndex: number) {
    const config = Link.get<ProjectConfig>("projectConfig")();
    const chunk = this.getChunk(chunkIndex);
    EngineDebugger.assertValue(chunk, {
      msg: "Save on change got non existent index",
    });
    const tiles: TileTemplate[] = [];
    chunk.getTiles.forEach((tile) =>
      tiles.push({
        collider: 0,
        index: tile.tileIndex,
        layers: tile.layers,
      })
    );
    const saveData: ChunkTemplate = {
      index: chunk.index,
      position: chunk.transform.position.get,
      tiles: tiles,
    };
    const ChunkFileStatus = await writeChunk({
      chunk: saveData,
      projectPath: config.projectPath,
    });
    console.log(ChunkFileStatus);
    if (!ChunkFileStatus.success) return ChunkFileStatus;
    return { error: "", success: true };
  }
  public static generateHollows(hollows: Set<number>) {
    hollows.forEach((index) => {
      if (this.hollowChunks.has(index)) return;
      const position = this.getSpiralPositionFromIndex(index);
      this.hollowChunks.set(index, new HollowChunk({ index, position }));
    });
  }
  public static findChunksInRange(position: { x: number; y: number }) {
    const config = Link.get<ProjectConfig>("projectConfig")();
    const w = config.chunkSizeInPixels.w;
    const h = config.chunkSizeInPixels.h;
    const chunks: Set<number> = new Set();

    for (let dy = -this.RINGS; dy <= this.RINGS; dy++) {
      for (let dx = -this.RINGS; dx <= this.RINGS; dx++) {
        const index = this.getSpiralIndexFromPosition({
          x: position.x + dx * w,
          y: position.y + dy * h,
        });
        chunks.add(index);
      }
    }
    return chunks;
  }

  public static remap(chunkIndex: number, chunkPosition: Position2D) {
    this.cameraOnChunk = chunkIndex;
    const chunk = this.findChunksInRange(chunkPosition);
    chunk.forEach(
      (index) => !this.loadedChunks.has(index) && this.chunksToAdd.add(index)
    );
    this.loadedChunks.forEach(
      (_, index) => !chunk.has(index) && this.chunksToRemove.add(index)
    );
    this.hollowChunks.forEach(
      (_, index) => !chunk.has(index) && this.hollowsToRemove.add(index)
    );
  }

  private static getSpiralIndexFromPosition(position: Position2D): number {
    const config = Link.get<ProjectConfig>("projectConfig")();

    const x = Math.floor(position.x / config.chunkSizeInPixels.w);
    const y = Math.floor(position.y / config.chunkSizeInPixels.h);

    if (x === 0 && y === 0) return 0;

    const ring = Math.max(Math.abs(x), Math.abs(y));
    const ringStart = (2 * (ring - 1) + 1) ** 2;

    if (y === -ring) return ringStart + (6 * ring - 1) + Math.abs(x + ring);
    if (x === ring) return ringStart - 1 + Math.abs(y + ring);
    if (x === -ring) return ringStart + (4 * ring - 1) + Math.abs(y - ring);
    if (y === ring) return ringStart + (2 * ring - 1) + Math.abs(x - ring);
    throw EngineDebugger.programBreak(
      `Spiral Index in entity manager not found, this should be impossible`
    );
  }
  private static getSpiralPositionFromIndex(index: number): Position2D {
    if (index === 0) return { x: 0, y: 0 };
    const config = Link.get<ProjectConfig>("projectConfig")();
    const x = config.chunkSizeInPixels.w;
    const y = config.chunkSizeInPixels.h;

    const ring = Math.ceil((Math.sqrt(index + 1) - 1) / 2);
    const startIndex = (2 * ring - 1) ** 2;
    const offset = index - startIndex;

    const side = Math.floor(offset / (ring * 2));
    const position = offset % (ring * 2);

    switch (side) {
      case 0:
        return { x: ring * x, y: (-ring + 1 + position) * y };
      case 1:
        return { x: (ring - 1 - position) * x, y: ring * y };
      case 2:
        return { x: -ring * x, y: (ring - 1 - position) * y };
      case 3:
        return { x: (-ring + 1 + position) * x, y: -ring * y };
    }
    throw EngineDebugger.programBreak(
      `Position from Spiral Index in entity manager not found, this should be impossible`
    );
  }
  private static getTilePosition(chunkPos: Position2D, tileIndex: number) {
    const config = Link.get<ProjectConfig>("projectConfig")();

    const tilesPerRow = config.chunkSizeInTiles.w;
    const tileXIndex = tileIndex % tilesPerRow;
    const tileYIndex = Math.floor(tileIndex / tilesPerRow);
    const x = chunkPos.x + tileXIndex * config.tileSize.w;
    const y = chunkPos.y + tileYIndex * config.tileSize.h;

    return { x, y };
  }
  // public static getLastRingIndexes() {
  //   const lastIndex = Array.from(this.loadedChunks.keys()).reduce(
  //     (maxIndex, currIndex) => (currIndex > maxIndex ? currIndex : maxIndex)
  //   );
  //   const chunkPosition = this.loadedChunks.get(lastIndex)!.transform.position;

  //   const config = Link.get<ProjectConfig>("projectConfig")();

  //   const x = Math.floor(chunkPosition.x / config.chunkSizeInPixels.w);
  //   const y = Math.floor(chunkPosition.y / config.chunkSizeInPixels.h);

  //   if (x === 0 && y === 0) return [1, 2, 3, 4, 5, 6, 7, 8];

  //   const ring = Math.max(Math.abs(x), Math.abs(y));
  //   const ringStartIndex = (2 * (ring - 1) + 1) ** 2;
  //   const numberOfIndexes = lastIndex - ringStartIndex;
  //   return Array.from(
  //     { length: numberOfIndexes },
  //     (_, index) => ringStartIndex + index
  //   );
  // }
}
