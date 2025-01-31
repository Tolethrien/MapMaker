import Tile from "../entities/tile";
import { randomColor } from "@/utils/utils";
import EngineDebugger from "../../modules/debugger";
import Chunk, { ChunkTemplate } from "../entities/chunk";
import Link from "@/utils/link";
import { loadChunks } from "@/preload/api/world";
import HollowChunk from "../entities/chunkHollow";

const SPIRAL_POSITION = {
  central: 0,
  E: 1,
  SE: 2,
  S: 3,
  SW: 4,
  W: 5,
  NW: 6,
  N: 7,
  NE: 8,
} as const;

export type ChunkPosition = keyof typeof SPIRAL_POSITION;
//TODO: czegos nie czyścisz jak wczytujesz projekt z juz wczytanego
//TODO: przenies API wczytywania mapy tutaj bo w sumie tym jest
export default class EntityManager {
  private static loadedChunks: Map<number, Chunk> = new Map();
  private static hollowChunks: Map<number, HollowChunk> = new Map();
  private static chunksToRemove: Set<number> = new Set();
  private static chunksToAdd: Set<number> = new Set();
  private static cameraOnChunk: number = 0;
  private static focusedChunk: number | undefined = undefined;
  private static RINGS = 2;

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
    return this.loadedChunks.get(this.focusedChunk!);
  }
  public static get getFocusedChunkIndex() {
    return this.focusedChunk;
  }
  public static setFocusedChunk(index: number | undefined) {
    this.focusedChunk = index;
  }
  public static updateAll() {
    Array.from(this.loadedChunks.values()).sort(
      ({ transform: chunkA }, { transform: chunkB }) => {
        if (chunkA.position.y === chunkB.position.y) {
          return chunkA.position.x - chunkB.position.x;
        }
        return chunkA.position.y - chunkB.position.y;
      }
    );
    this.loadedChunks.forEach((chunk) => chunk.update());
    this.hollowChunks.forEach((chunk) => chunk.update());
  }
  public static renderAll() {
    this.loadedChunks.forEach((chunk) => chunk.render());
    this.hollowChunks.forEach((chunk) => chunk.render());
  }
  public static clearAll() {
    this.loadedChunks.clear();
  }
  public static async frameCleanUp() {
    if (this.chunksToRemove.size === 0 && this.chunksToAdd.size === 0) return;
    this.chunksToRemove.forEach((index) => this.loadedChunks.delete(index));
    await loadChunks(this.chunksToAdd);
    this.chunksToRemove.clear();
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
  public static createEmptyChunk(side: ChunkPosition, position: Position2D) {
    // jesli cos nie pojdzie w tworzeniu chunka to i tak go dodajesz do gry ale nie tworzysz pliku, jakas 2 stronna komunikacja?
    const config = Link.get<ProjectConfig>("projectConfig")();
    const numberOfTiles = config.chunkSizeInTiles.w * config.chunkSizeInTiles.h;
    const { x, y } = this.getChunkNextToCenter(side, position);

    const chunkIndex = this.getSpiralIndexFromPosition({ x, y });
    // mozesz np spawdzic czy taki jest juz wgrany
    const chunk = new Chunk({ index: chunkIndex, position: { x, y } });
    const data: Tile[] = [];
    Array(numberOfTiles)
      .fill(null)
      .forEach((_, index) => {
        const tilePos = this.getTilePosition({ x, y }, index);
        const tile = new Tile({
          pos: tilePos,
          chunkIndex: chunkIndex,
          tileIndex: index,
          layers: [],
        });
        data.push(tile);
        chunk.addTile(tile);
      });
    this.loadedChunks.set(chunkIndex, chunk);
    return { chunkIndex, position: { x, y }, data };
  }
  public static generateHollows(hollows: number[]) {
    //TODO: nie rob tego dla wszystkich chunkow a jedynie ościennych
    hollows.forEach((index) => {
      const position = this.getSpiralPositionFromIndex(index);
      this.hollowChunks.set(index, new HollowChunk({ index, position }));
    });
    console.log(this.hollowChunks);
  }
  public static getLastRingIndexes() {
    const lastIndex = Array.from(this.loadedChunks.keys()).reduce(
      (maxIndex, currIndex) => (currIndex > maxIndex ? currIndex : maxIndex)
    );
    const chunkPosition = this.loadedChunks.get(lastIndex)!.transform.position;

    const config = Link.get<ProjectConfig>("projectConfig")();

    const x = Math.floor(chunkPosition.x / config.chunkSizeInPixels.w);
    const y = Math.floor(chunkPosition.y / config.chunkSizeInPixels.h);

    if (x === 0 && y === 0) return [1, 2, 3, 4, 5, 6, 7, 8];

    const ring = Math.max(Math.abs(x), Math.abs(y));
    const ringStartIndex = (2 * (ring - 1) + 1) ** 2;
    const numberOfIndexes = lastIndex - ringStartIndex;
    return Array.from(
      { length: numberOfIndexes },
      (_, index) => ringStartIndex + index
    );
  }
  public static findChunksInRange(position: { x: number; y: number }) {
    const config = Link.get<ProjectConfig>("projectConfig")();

    const chunks: Set<number> = new Set();
    const sides = this.getRingsFromChunk(
      position,
      config.chunkSizeInPixels,
      this.RINGS
    );
    sides.forEach((position) =>
      chunks.add(this.getSpiralIndexFromPosition(position))
    );
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
  }

  private static getChunkNextToCenter(
    side: ChunkPosition,
    position: Position2D
  ) {
    const config = Link.get<ProjectConfig>("projectConfig")();

    const sides = this.getChunkSizePosition(position, config.chunkSizeInPixels);
    return sides[side];
  }

  private static getChunkSizePosition({ x, y }: Position2D, { h, w }: Size2D) {
    return {
      central: { x, y },
      E: { x: x + w, y },
      SE: { x: x + w, y: y + h },
      S: { x, y: y + h },
      SW: { x: x - w, y: y + h },
      W: { x: x - w, y },
      NW: { x: x - w, y: y - h },
      N: { x, y: y - h },
      NE: { x: x + w, y: y - h },
    };
  }
  private static getRingsFromChunk(
    { x, y }: Position2D,
    { h, w }: Size2D,
    range: number
  ) {
    //TODO: do something better
    const result: Position2D[] = [];
    //loop through all spiral rings in range
    for (let ring = 0; ring <= range; ring++) {
      //standard grid looping
      for (let i = -ring; i <= ring; i++) {
        for (let j = -ring; j <= ring; j++) {
          const curr = { x: x + i * w, y: y + j * h };
          //add only when not on a list
          if (!result.some((chunk) => chunk.x === curr.x && chunk.y === curr.y))
            result.push(curr);
        }
      }
    }
    return result;
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
  public static getSpiralPositionFromIndex(index: number): Position2D {
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
}
