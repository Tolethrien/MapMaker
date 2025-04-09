import Tile, { BaseStructureLayer, BaseTileLayer } from "../entities/tile";
import EngineDebugger from "../../modules/debugger";
import Chunk from "../entities/chunk";
import Link from "@/utils/link";
import HollowChunk from "../entities/chunkHollow";
import { getAPI } from "@/preload/getAPI";
import { getConfig, sendNotification } from "@/utils/utils";
import { LayersLevel, PassManifold, Selectors } from "@/preload/globalLinks";
import InputManager from "../../modules/inputManager";
import GlobalStore from "../../modules/globalStore";
import AssetsManager, { LutType } from "@/engine/core/modules/assetsManager";
import MathU from "@/math/math";
import { saveChunkOnChange } from "@/utils/projectUtils";
export interface exportedTile {
  //in tile
  collider: boolean;
  tileLayers: BaseTileLayer[];
  structureLayers: BaseStructureLayer[];
}
export interface ExportedChunk {
  position: Position2D;
  index: number;
  tiles: exportedTile[];
}
const { readChunk, writeChunk } = getAPI("project");

export default class EntityManager {
  private static loadedChunks: Map<number, Chunk> = new Map();
  private static hollowChunks: Map<number, HollowChunk> = new Map();
  private static chunksToRemove: Set<number> = new Set();
  private static hollowsToRemove: Set<number> = new Set();
  private static chunksToAdd: Set<number> = new Set();
  public static RINGS = 8;
  private static LayerVisibility: {
    tile: Map<number, number>;
    structure: Map<number, number>;
  } = { structure: new Map(), tile: new Map() };
  private static lastChangedTile: Tile | undefined = undefined;

  public static updateLayerVis(LUT: LutType, index: number, value: number) {
    this.LayerVisibility[LUT].set(index, value);
  }
  public static getLayerVis(LUT: LutType, index: number) {
    return this.LayerVisibility[LUT].get(index) ?? 255;
  }
  public static getVisibilityList() {
    return this.LayerVisibility;
  }
  public static getAllChunks() {
    return this.loadedChunks;
  }
  public static getChunk(index: number) {
    return this.loadedChunks.get(index);
  }
  public static getHollows() {
    return this.hollowChunks;
  }

  public static onEvent() {
    const [getter] = GlobalStore.get<PassManifold>("passManifold");
    if (getter.type === "tile") {
      this.onTileEvents(getter.LutID);
    } else {
      this.onStructEvents(getter.LutID);
    }
  }
  public static onUpdate() {}

  public static onRender() {
    const selector = Link.get<Selectors>("activeSelector")();

    const sorted = Array.from(this.loadedChunks.values()).sort(
      ({ position: chunkA }, { position: chunkB }) => {
        if (chunkA.y === chunkB.y) {
          return chunkA.x - chunkB.x;
        }
        return chunkA.y - chunkB.y;
      }
    );

    // if (selector === "brush")
    //   this.hollowChunks.forEach((chunk) => chunk.onRender());
    sorted.forEach((chunk) => chunk.onRender("tile"));
    sorted.forEach((chunk) => chunk.onRender("structure"));
  }
  private static onTileEvents(lutID: string) {
    if (InputManager.onMouseDown("left")) {
      const { tile: layerIndex } = Link.get<LayersLevel>("layer")();
      const tile = this.getTileToChange(layerIndex, lutID);
      if (!tile) return;
      const lutData = AssetsManager.getItem("tile", lutID);
      EngineDebugger.assertValue(lutData, {
        msg: "in place event should always be a lut item from AM",
      });
      const zIndex = Link.get<number>("z-index")();
      tile.addTileLayer({ item: lutData.item, layerIndex, zIndex });
      //TODO: zamiast zapisywac co kazda zmiana kafla moze lepiej co X ms?
      //np tagowac ze chunk wymaga zmiany i za X sekund to zrobic jesli nie ma przy nim aktywnosci zadnej wiekszej (debounce)
      saveChunkOnChange(tile.chunkIndex);
    }
  }
  public static onStructEvents(lutID: string) {
    if (InputManager.onMouseClick("left")) {
      const lutItem = AssetsManager.getItem("structure", lutID);
      EngineDebugger.assertValue(lutItem, {
        msg: "in place event should always be a lut item from AM",
      });
      const { item } = lutItem;
      const zIndex = Link.get<number>("z-index")();
      const { tileSize, chunkSizeInTiles } = getConfig();
      const { structure: layerIndex } = Link.get<LayersLevel>("layer")();

      const mousePos = InputManager.getMousePosition();
      const { tileCol: anchorCol, tileRow: anchorRow } = MathU.getTilePosInGrid(
        item.anchorTile,
        item.objectTileSize.w
      );
      //left top struct tile  in world
      const structCol = Math.floor(mousePos.x / tileSize.w) - anchorCol;
      const structRow = Math.floor(mousePos.y / tileSize.h) - anchorRow;
      const anchorTile = this.getWorldTileFromStructTile(
        item.anchorTile,
        { col: structCol, row: structRow },
        item.objectTileSize
      );

      EngineDebugger.assertValue(anchorTile);
      if (anchorTile) {
        anchorTile.addStructLayer({
          item,
          layerIndex,
          zIndex,
        });
      }
      // calculating indexes and chunks of all tiles
      for (const structTileIndex of item.colliderTiles) {
        const colliderTile = this.getWorldTileFromStructTile(
          structTileIndex,
          { col: structCol, row: structRow },
          item.objectTileSize
        );
        if (colliderTile && colliderTile.index !== anchorTile.index)
          colliderTile.addDecorativeLayer({
            layerIndex,
            lutID: item.id,
            viewID: item.viewID,
            structureIndex: structTileIndex,
          });
      }
      saveChunkOnChange(anchorTile.chunkIndex);
    }
  }
  private static getTile(chunk: number, tile: number) {
    return this.loadedChunks.get(chunk)?.getTiles.get(tile);
  }
  public static getWorldTileFromStructTile(
    structTileIndex: number,
    struct: { col: number; row: number },
    itemInTiles: Size2D
  ) {
    const { tileSize, chunkSizeInTiles } = getConfig();
    const tileCol = structTileIndex % itemInTiles.w;
    const tileRow = Math.floor(structTileIndex / itemInTiles.w);

    const chunkIndex = MathU.getSpiralIndexFromPosition({
      x: (struct.col + tileCol) * tileSize.w,
      y: (struct.row + tileRow) * tileSize.h,
    });
    const chunk = this.loadedChunks.get(chunkIndex);
    if (!chunk) return undefined;

    const chunkTileColStart = Math.floor(chunk.position.x / tileSize.w);
    const chunkTileRowStart = Math.floor(chunk.position.y / tileSize.h);

    const tileIndex =
      (struct.row + tileRow - chunkTileRowStart) * chunkSizeInTiles.w +
      (struct.col + tileCol - chunkTileColStart);
    const tile = chunk.getTiles.get(tileIndex);
    if (!tile) return undefined;
    return tile;
  }

  public static clearAll() {
    this.loadedChunks.clear();
    this.hollowChunks.clear();
  }
  public static async frameCleanUp(newChunk: number) {
    this.remapChunks(newChunk);
    if (this.chunksToRemove.size === 0 && this.chunksToAdd.size === 0) return;
    this.chunksToRemove.forEach((index) => this.loadedChunks.delete(index));
    this.hollowsToRemove.forEach((index) => this.hollowChunks.delete(index));
    await this.loadChunks();
    this.chunksToRemove.clear();
    this.hollowsToRemove.clear();
  }
  public static async loadChunks() {
    //TODO: change this to own threat and delegating jobs
    const config = getConfig();
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
  public static populateChunk(chunkData: ExportedChunk) {
    const { chunkSizeInTiles, tileSize } = getConfig();
    const chunk = new Chunk({
      index: chunkData.index,
      position: chunkData.position,
    });

    chunkData.tiles.forEach((tileData, index) => {
      const tilePos = MathU.getTileCoordinatesFromIndex({
        index,
        gridWidth: chunkSizeInTiles.w,
        tileSize,
        offset: chunk.position,
      });
      const tile = new Tile({
        pos: tilePos,
        chunkIndex: chunkData.index,
        tileIndex: index,
        structureLayers: tileData.structureLayers,
        tileLayers: tileData.tileLayers,
      });
      chunk.addTile(tile);
    });
    this.loadedChunks.set(chunkData.index, chunk);
  }
  public static async createEmptyChunk(chunkIndex: number) {
    const { chunkSizeInTiles, tileSize, projectPath } = getConfig();
    const numberOfTiles = chunkSizeInTiles.w * chunkSizeInTiles.h;
    const position = MathU.getSpiralPositionFromIndex(chunkIndex);
    const chunk = new Chunk({ index: chunkIndex, position });
    Array(numberOfTiles)
      .fill(null)
      .forEach((_, tileIndex) => {
        const tilePos = MathU.getTileCoordinatesFromIndex({
          index: tileIndex,
          gridWidth: chunkSizeInTiles.w,
          tileSize: tileSize,
          offset: chunk.position,
        });
        const tile = new Tile({
          pos: tilePos,
          chunkIndex: chunkIndex,
          tileIndex: tileIndex,
          structureLayers: [],
          tileLayers: [],
        });
        chunk.addTile(tile);
      });
    this.hollowChunks.delete(chunkIndex);
    this.loadedChunks.set(chunkIndex, chunk);

    const ChunkFileStatus = await writeChunk({
      chunk: {
        index: chunkIndex,
        position: { x: position.x, y: position.y },
        tiles: Array.from(chunk.getTiles.values()).map((tile) => {
          return {
            collider: false,
            structureLayers: [],
            tileLayers: [],
          };
        }),
      },
      projectPath: projectPath,
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

  public static generateHollows(hollows: Set<number>) {
    hollows.forEach((index) => {
      if (this.hollowChunks.has(index)) return;
      const position = MathU.getSpiralPositionFromIndex(index);
      this.hollowChunks.set(index, new HollowChunk({ index, position }));
    });
  }

  private static remapChunks(cameraOnChunkIndex: number) {
    const chunkPosition = MathU.getSpiralPositionFromIndex(cameraOnChunkIndex);
    const chunk = MathU.getChunksInRange(chunkPosition, this.RINGS);
    chunk.forEach(
      (chunkIndex) =>
        !this.loadedChunks.has(chunkIndex) &&
        !this.hollowChunks.has(chunkIndex) &&
        this.chunksToAdd.add(chunkIndex)
    );
    this.loadedChunks.forEach(
      (_, chunkIndex) =>
        !chunk.has(chunkIndex) && this.chunksToRemove.add(chunkIndex)
    );
    this.hollowChunks.forEach(
      (_, chunkIndex) =>
        !chunk.has(chunkIndex) && this.hollowsToRemove.add(chunkIndex)
    );
  }

  public static getTileToRemove() {
    const mouseOn = InputManager.getMouseHover;
    const tile = this.getTile(mouseOn.chunk, mouseOn.tile);
    if (!tile) return;
    this.lastChangedTile = tile;
    return tile;
  }
  public static getTileToChange(layerIndex: number, lutID: string) {
    const mouseOn = InputManager.getMouseHover;
    const tile = this.getTile(mouseOn.chunk, mouseOn.tile);
    if (!tile) return;
    if (
      mouseOn.tile === this.lastChangedTile?.index &&
      this.lastChangedTile?.tileLayers[layerIndex]?.lutID === lutID
    )
      return;
    this.lastChangedTile = tile;
    return tile;
  }
}
