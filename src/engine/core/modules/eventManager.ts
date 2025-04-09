import { LayersLevel, PassManifold, Selectors } from "@/preload/globalLinks";
import Link from "@/utils/link";
import InputManager from "./inputManager";
import GlobalStore from "./globalStore";
import AssetsManager, { LutType } from "./assetsManager";
import EntityManager from "../entitySystem/core/entityManager";
import EngineDebugger from "./debugger";
import { saveChunkOnChange } from "@/utils/projectUtils";
import { getConfig } from "@/utils/utils";
import MathU from "@/math/math";

export default class EventManager {
  public static update() {
    const selector = Link.get<Selectors>("activeSelector")();
    if (selector === "brush") this.brushEvents();
    else if (selector === "eraser") this.eraserEvents();
    else this.lifterEvents();
  }
  //MAIN EVENTS
  private static brushEvents() {
    if (InputManager.onMouseDown("left")) this.brushSingleDrawEvent();
    else if (InputManager.onMouseDown("right")) this.brushShapeDrawEvent();
  }
  private static eraserEvents() {
    if (InputManager.onMouseDown("left")) this.singleEraseEvent();
    else if (InputManager.onMouseDown("right")) this.shapeEraseEvent();
  }
  private static lifterEvents() {
    if (InputManager.onMouseClick("left")) this.liftUpEvent();
    else if (InputManager.onMouseClick("right")) this.liftDownEvent();
  }

  //DISPATCHER OF EVENTS
  private static brushSingleDrawEvent() {
    this.dispatchBasedOnManifold(
      () => this.addSingleTile(),
      () => this.addSingleStruct()
    );
  }
  private static brushShapeDrawEvent() {
    this.dispatchBasedOnManifold(
      () => this.addButchTiles(),
      () => this.addBatchStructs()
    );
  }
  private static singleEraseEvent() {
    this.dispatchBasedOnManifold(
      () => this.removeTile(),
      () => this.removeStruct()
    );
  }
  private static shapeEraseEvent() {
    this.dispatchBasedOnManifold(
      () => this.removeBatchTiles(),
      () => this.removeBatchStructs()
    );
  }
  private static liftUpEvent() {
    //JAK TO ZROBIC DLA TILE I STRUCT?!
    console.log("lift up");
  }
  private static liftDownEvent() {
    console.log("lift down");
  }
  // ACTUAL EVENTS xD
  private static addSingleTile() {
    const { tile: layerIndex } = Link.get<LayersLevel>("layer")();
    const [getter] = GlobalStore.get<PassManifold>("passManifold");

    const tile = EntityManager.getTileToChange(layerIndex, getter.LutID);
    if (!tile) return;
    const lutData = AssetsManager.getItem("tile", getter.LutID);
    EngineDebugger.assertValue(lutData, {
      msg: "in place event should always be a lut item from AM",
    });
    const zIndex = Link.get<number>("z-index")();
    tile.addTileLayer({ item: lutData.item, layerIndex, zIndex });
    //TODO: zamiast zapisywac co kazda zmiana kafla moze lepiej co X ms?
    //np tagowac ze chunk wymaga zmiany i za X sekund to zrobic jesli nie ma przy nim aktywnosci zadnej wiekszej (debounce)
    saveChunkOnChange(tile.chunkIndex);
  }
  private static addSingleStruct() {
    const [getter] = GlobalStore.get<PassManifold>("passManifold");
    const lutItem = AssetsManager.getItem("structure", getter.LutID);
    EngineDebugger.assertValue(lutItem, {
      msg: "in place event should always be a lut item from AM",
    });
    const { item } = lutItem;
    const zIndex = Link.get<number>("z-index")();
    const { tileSize } = getConfig();
    const { structure: layerIndex } = Link.get<LayersLevel>("layer")();

    const mousePos = InputManager.getMousePosition();
    const { tileCol: anchorCol, tileRow: anchorRow } = MathU.getTilePosInGrid(
      item.anchorTile,
      item.objectTileSize.w
    );
    //left top struct tile  in world
    const structCol = Math.floor(mousePos.x / tileSize.w) - anchorCol;
    const structRow = Math.floor(mousePos.y / tileSize.h) - anchorRow;
    const anchorTile = EntityManager.getWorldTileFromStructTile(
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
      const colliderTile = EntityManager.getWorldTileFromStructTile(
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
  private static addButchTiles() {}
  private static addBatchStructs() {}
  private static removeTile() {
    const { tile: layerIndex } = Link.get<LayersLevel>("layer")();
    const tile = EntityManager.getTileToRemove();
    if (!tile) return;
    tile.removeTileLayer(layerIndex);
    //TODO: zamiast zapisywac co kazda zmiana kafla moze lepiej co X ms?
    //np tagowac ze chunk wymaga zmiany i za X sekund to zrobic jesli nie ma przy nim aktywnosci zadnej wiekszej (debounce)
    saveChunkOnChange(tile.chunkIndex);
  }
  private static removeStruct() {
    const { tile: layerIndex } = Link.get<LayersLevel>("layer")();
    const tile = EntityManager.getTileToRemove();
    if (!tile) return;
    const layer = tile.structureLayers.find(
      (layer) => layer.layerIndex === layerIndex
    );
    if (!layer) return;
    const itemData = AssetsManager.getItem("structure", layer.lutID);
    if (!itemData) return;
    const item = itemData.item;
    const { tileSize } = getConfig();
    const mousePos = InputManager.getMousePosition();
    const { tileCol: anchorCol, tileRow: anchorRow } = MathU.getTilePosInGrid(
      item.anchorTile,
      item.objectTileSize.w
    );
    //left top struct tile  in world
    const structCol = Math.floor(mousePos.x / tileSize.w) - anchorCol;
    const structRow = Math.floor(mousePos.y / tileSize.h) - anchorRow;
    const anchorTile = EntityManager.getWorldTileFromStructTile(
      item.anchorTile,
      { col: structCol, row: structRow },
      item.objectTileSize
    );
    console.log(tile);
    // tile.removeStructLayer(layer.layerIndex);
    // saveChunkOnChange(tile.chunkIndex);

    // for (const structTileIndex of item.colliderTiles) {
    //   const colliderTile = EntityManager.getWorldTileFromStructTile(
    //     structTileIndex,
    //     { col: structCol, row: structRow },
    //     item.objectTileSize
    //   );
    //   if (colliderTile && colliderTile.index !== anchorTile.index)
    //     colliderTile.addDecorativeLayer({
    //       layerIndex,
    //       lutID: item.id,
    //       viewID: item.viewID,
    //       structureIndex: structTileIndex,
    //     });
    // }
  }
  private static removeBatchTiles() {}
  private static removeBatchStructs() {}
  //HELPERS
  private static dispatchBasedOnManifold(
    tileFunc: () => void,
    structFunc: () => void
  ) {
    const active = Link.get<LutType>("activeLUT")();
    if (active === "tile") tileFunc();
    else if (active === "structure") structFunc();
  }
}
