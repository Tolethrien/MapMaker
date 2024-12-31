import Tile from "@/engine/sandbox/entities/tile";
import Entity from "./entity";
import GlobalStore from "../modules/globalStore/globalStore";
import EngineDebugger from "../modules/debugger/debugger";
import { randomColor } from "@/utils/utils";
import Chunk from "@/engine/sandbox/entities/chunk";

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
type ChunkMeta = {
  index: number;
  position: Position2D;
  spiralPosition: number;
};
interface LoadedChunk {
  getTiles: Set<Entity["id"]>;
  meta: ChunkMeta | undefined;
}
export interface ProjectConfig {
  projectPath: string;
  name: string;
  tileSize: Size2D;
  chunkSizeInTiles: Size2D;
  chunkSizeInPixels: Size2D;
}
export default class EntityManager {
  private static entitiesPool: Map<Entity["id"], Entity> = new Map();
  private static loadedChunks: Map<ChunkPosition, Chunk> = new Map(
    Object.keys(SPIRAL_POSITION).map((key: ChunkPosition) => [
      key,
      new Chunk(SPIRAL_POSITION[key]),
    ])
  );

  public static getAllEntities() {
    return Array.from(this.entitiesPool.values()).map((tile) => tile);
  }
  public static getAllLoadedChunksMeta() {
    return this.loadedChunks;
  }
  public static getEntityPool() {
    return this.entitiesPool;
  }
  public static getEntitiesFromChunkByDirection(chunk: ChunkPosition) {
    const tiles: Entity[] = [];
    this.loadedChunks.get(chunk).getTiles.forEach((entityID) => {
      const tile = this.entitiesPool.get(entityID);
      if (tile) tiles.push(tile);
    });
    return tiles;
  }
  public static addEntity(entity: Entity, chunk: ChunkPosition) {
    this.loadedChunks.get(chunk).getTiles.add(entity.getID);
    this.entitiesPool.set(entity.getID, entity);
  }
  public static removeEntity(entityID: Entity["id"], chunk: ChunkPosition) {
    this.entitiesPool.delete(entityID);
    this.loadedChunks.get(chunk).getTiles.delete(entityID);
  }
  public static clearChunk(chunk: ChunkPosition) {
    const chunkData = this.loadedChunks.get(chunk);
    chunkData.getTiles.forEach((entityID) => {
      this.entitiesPool.delete(entityID);
    });
    chunkData.getTiles.clear();
  }
  public static deleteAllEntities() {
    this.entitiesPool.clear();
    this.loadedChunks.forEach((chunk) => chunk.getTiles.clear());
  }
  public static clearAllManagerData() {
    this.entitiesPool.clear();
    this.loadedChunks.forEach((chunk) => chunk.clear());
  }
  //TODO: domyslnie nie bedzie potrzeba chyba 2 loopow bo nie ma zadnej fizyki? chyba ze swiatło
  public static updateAll() {
    this.entitiesPool.forEach((entity) => entity.update());
  }
  public static renderAll() {
    this.entitiesPool.forEach((entity) => entity.render());
  }
  public static populateChunk(chunk: ChunkPosition, chunkData: ChunkTemplate) {
    this.loadedChunks.get(chunk).setMeta({
      index: chunkData.index,
      position: chunkData.position,
      active: true,
    });

    chunkData.tiles.forEach((tileData, index) => {
      const tilePos = this.getTilePosition(chunkData.position, index);
      const tile = new Tile({
        pos: tilePos,
        color: tileData.layers[0].color,
        chunkIndex: chunkData.index,
        tileIndex: index,
      });
      this.addEntity(tile, chunk);
    });
  }
  public static relocateChunk(from: ChunkPosition, to: ChunkPosition) {
    //hope will transfer reference so no need to repopulate entities and meta
    // this need to be done in reversed order of movement of a camera
    //so if i move left:
    // discard last(right) => move center to last => move first(left) to center => add new first
    const chunkA = this.loadedChunks.get(from);
    const chunkB = this.loadedChunks.get(to);
    chunkB.setMeta(chunkA.getMeta);
    chunkB.overrideTiles(chunkA.getTiles);
    chunkA.clear();
  }

  public static createEmptyChunk(chunk: ChunkPosition, position: Position2D) {
    const [config] = GlobalStore.get<ProjectConfig>("projectConfig");
    const numberOfTiles = config.chunkSizeInTiles.w * config.chunkSizeInTiles.h;

    const { x, y } = this.getChunkNextToCenter(chunk, position);
    const chunkIndex = this.getChunkSpiralIndex({ x, y });
    this.loadedChunks
      .get(chunk)
      .setMeta({ index: chunkIndex, position: { x, y }, active: true });

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
        this.addEntity(tile, chunk);
      });

    return { chunkIndex, position: { x, y }, data };
  }
  public static findChunksInRange(position: { x: number; y: number }) {
    const [config] = GlobalStore.get<ProjectConfig>("projectConfig");

    const sides = this.getSides(position, config.chunkSizeInPixels);
    return Object.entries(sides).map(([side, position]) => {
      return {
        side: side as ChunkPosition,
        index: this.getChunkSpiralIndex(position),
      };
    });
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
}
