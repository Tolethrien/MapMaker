import Tile from "../entities/tile";
import { randomColor } from "@/utils/utils";
import EngineDebugger from "../../modules/debugger";
import Chunk, { ChunkTemplate } from "../entities/chunk";
import Link from "@/utils/link";
import { loadChunks } from "@/preload/api/world";

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
  private static chunksToRemove: Set<number> = new Set();
  private static chunksToAdd: Set<number> = new Set();
  private static cameraOnChunk: number = 0;
  private static focusedChunk: number | undefined = undefined;
  private static RINGS = 1;

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
  }
  public static renderAll() {
    this.loadedChunks.forEach((chunk) => chunk.render());
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
        color: tileData.layers[0].color,
        chunkIndex: chunkData.index,
        tileIndex: index,
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

    const chunkIndex = this.getChunkSpiralIndex({ x, y });
    // mozesz np spawdzic czy taki jest juz wgrany
    const chunk = new Chunk({ index: chunkIndex, position: { x, y } });
    const data: Tile[] = [];
    Array(numberOfTiles)
      .fill(null)
      .forEach((_, index) => {
        const tilePos = this.getTilePosition({ x, y }, index);
        const tile = new Tile({
          pos: tilePos,
          color: randomColor(),
          chunkIndex: chunkIndex,
          tileIndex: index,
        });
        data.push(tile);
        chunk.addTile(tile);
      });
    this.loadedChunks.set(chunkIndex, chunk);
    return { chunkIndex, position: { x, y }, data };
  }

  public static findChunksInRange(position: { x: number; y: number }) {
    const config = Link.get<ProjectConfig>("projectConfig")();

    const chunks: Set<number> = new Set();
    const sides = this.getRingsFromChunk(
      position,
      config.chunkSizeInPixels,
      this.RINGS
    );
    sides.forEach((position) => chunks.add(this.getChunkSpiralIndex(position)));
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
  private static getChunkSpiralIndex(position: Position2D): number {
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
