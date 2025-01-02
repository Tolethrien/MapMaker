import GlobalStore from "../../modules/globalStore/globalStore";
import Til from "../entities/tile";
import { randomColor } from "@/utils/utils";
import EngineDebugger from "../../modules/debugger/debugger";
import Chunk from "../entities/chunk";
import { loadChunks } from "@/API/project";
export interface ProjectConfig {
  projectPath: string;
  name: string;
  tileSize: Size2D;
  chunkSizeInTiles: Size2D;
  chunkSizeInPixels: Size2D;
}
export interface TileLayer {
  color: HSLA;
  zIndex: number;
  graphicID: number;
}
export interface TileTemplate {
  index: number;
  collider: 0 | 1;
  layers: TileLayer[];
}

export interface ChunkTemplate {
  position: Position2D;
  index: number;
  tiles: TileTemplate[];
}
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

export default class EntityManager {
  // change to linkedList to avoid "reIndexing"?
  // or map? think later
  private static spiralChunkArray: Chunk[] = [];
  private static chunksToRemove: Set<number> = new Set();
  private static chunksToAdd: Set<number> = new Set();

  private static cameraOnChunk: number = 0;
  private static focusedChunk: Chunk | undefined = undefined;

  public static getAllChunks() {
    return this.spiralChunkArray;
  }

  public static get getCameraOnChunk() {
    return this.cameraOnChunk;
  }

  public static get getFocusedChunk() {
    return this.focusedChunk;
  }
  public static setFocusedChunk(chunk: Chunk) {
    this.focusedChunk = chunk;
  }
  public static updateAll() {
    this.spiralChunkArray.forEach((chunk) => chunk.update());
  }
  public static renderAll() {
    //TODO: render spiral sorted not like that
    this.spiralChunkArray.forEach((chunk) => chunk.render());
  }
  public static clearAll() {
    this.spiralChunkArray = [];
  }

  public static populateChunk(chunkData: ChunkTemplate) {
    const chunk = new Chunk({
      index: chunkData.index,
      position: chunkData.position,
    });
    chunkData.tiles.forEach((tileData, index) => {
      const tilePos = this.getTilePosition(chunkData.position, index);
      const tile = new Til({
        pos: tilePos,
        color: tileData.layers[0].color,
        chunkIndex: chunkData.index,
        tileIndex: index,
      });
      chunk.addTile(tile);
    });
    this.spiralChunkArray.push(chunk);
  }
  public static createEmptyChunk(side: ChunkPosition, position: Position2D) {
    // jesli cos nie pojdzie w tworzeniu chunka to i tak go dodajesz do gry ale nie tworzysz pliku, jakas 2 stronna komunikacja?
    const [config] = GlobalStore.get<ProjectConfig>("projectConfig");
    const numberOfTiles = config.chunkSizeInTiles.w * config.chunkSizeInTiles.h;
    const { x, y } = this.getChunkNextToCenter(side, position);

    const chunkIndex = this.getChunkSpiralIndex({ x, y });
    // mozesz np spawdzic czy taki jest juz wgrany
    const chunk = new Chunk({ index: chunkIndex, position: { x, y } });
    const data: Til[] = [];
    Array(numberOfTiles)
      .fill(null)
      .forEach((_, index) => {
        const tilePos = this.getTilePosition({ x, y }, index);
        const tile = new Til({
          pos: tilePos,
          color: randomColor(),
          chunkIndex: chunkIndex,
          tileIndex: index,
        });
        data.push(tile);
        chunk.addTile(tile);
      });
    this.spiralChunkArray.push(chunk);
    return { chunkIndex, position: { x, y }, data };
  }
  public static findChunksInRange(position: { x: number; y: number }) {
    //TODO: moge zmienic kolejnosc tutaj by nie musieć potem sortowac bo juz tutaj dostane posortowana?

    const [config] = GlobalStore.get<ProjectConfig>("projectConfig");

    const sides = this.getSides(position, config.chunkSizeInPixels);
    return Object.entries(sides).map(([side, position]) =>
      this.getChunkSpiralIndex(position)
    );
  }
  public static async validateChunks() {
    //TODO: zrobic to lepiej by nie szukac tyle
    if (this.chunksToRemove.size === 0 && this.chunksToAdd.size === 0) return;
    this.chunksToRemove.forEach((index) => {
      const chunkIndex = this.spiralChunkArray.findIndex(
        (chunk) => chunk.index === index
      );
      this.spiralChunkArray.splice(chunkIndex, 1);
    });
    await loadChunks(this.chunksToAdd);
    this.chunksToRemove.clear();
    this.chunksToAdd.clear();
    console.log(this.spiralChunkArray.length);
  }
  public static remap(chunkIndex: number, chunkPosition: Position2D) {
    console.log("remaping...");
    this.cameraOnChunk = chunkIndex;
    console.log(this.findChunksInRange(chunkPosition));
    const chunk = new Set(this.findChunksInRange(chunkPosition));
    const loadedChunks = new Set(
      this.spiralChunkArray.map((chunk) => chunk.index)
    );
    chunk.forEach(
      (index) => !loadedChunks.has(index) && this.chunksToAdd.add(index)
    );
    loadedChunks.forEach(
      (index) => !chunk.has(index) && this.chunksToRemove.add(index)
    );
    console.log("adding...", this.chunksToAdd);
    console.log("removing...", this.chunksToRemove);
  }

  private static getChunkNextToCenter(
    side: ChunkPosition,
    position: Position2D
  ) {
    const [config] = GlobalStore.get<ProjectConfig>("projectConfig");

    const sides = this.getSides(position, config.chunkSizeInPixels);
    return sides[side];
  }
  private static getSides({ x, y }: Position2D, { h, w }: Size2D) {
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
  private static getChunkSpiralIndex(position: Position2D) {
    const [config] = GlobalStore.get<ProjectConfig>("projectConfig");

    const x = Math.floor(position.x / config.chunkSizeInPixels.w);
    const y = Math.floor(position.y / config.chunkSizeInPixels.h);

    if (x === 0 && y === 0) return 0;

    const ring = Math.max(Math.abs(x), Math.abs(y));
    const ringStart = (2 * (ring - 1) + 1) ** 2;

    if (y === -ring) return ringStart + (6 * ring - 1) + Math.abs(x + ring);
    if (x === ring) return ringStart - 1 + Math.abs(y + ring);
    if (x === -ring) return ringStart + (4 * ring - 1) + Math.abs(y - ring);
    if (y === ring) return ringStart + (2 * ring - 1) + Math.abs(x - ring);
    EngineDebugger.showWarn(
      `Spiral Index not found, this should be impossible`
    );
  }
  private static getTilePosition(chunkPos: Position2D, tileIndex: number) {
    const [config] = GlobalStore.get<ProjectConfig>("projectConfig");

    const tilesPerRow = config.chunkSizeInTiles.w;
    const tileXIndex = tileIndex % tilesPerRow;
    const tileYIndex = Math.floor(tileIndex / tilesPerRow);
    const x = chunkPos.x + tileXIndex * config.tileSize.w;
    const y = chunkPos.y + tileYIndex * config.tileSize.h;

    return { x, y };
  }
}
