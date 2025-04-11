import { LayersLevel, PassManifold, Selectors } from "@/preload/globalLinks";
import Link from "@/utils/link";
import InputManager from "./inputManager";
import GlobalStore from "./globalStore";
import AssetsManager, { LutType } from "./assetsManager";
import EntityManager from "../entitySystem/core/entityManager";
import EngineDebugger from "./debugger";
import { saveChunkOnChange } from "@/utils/projectUtils";
import { getConfig, sendNotification } from "@/utils/utils";

export default class EventManager {
  public static update() {
    const gridMenu = Link.get<boolean>("gridMenu")();
    const selector = Link.get<Selectors>("activeSelector")();

    if (gridMenu) this.gridEvents();
    else if (selector === "brush") this.brushEvents();
    else if (selector === "eraser") this.eraserEvents();
    else if (selector === "lifter") this.lifterEvents();
  }
  //MAIN EVENTS
  private static async gridEvents() {
    if (InputManager.onMouseClick("left")) {
      const chunk = InputManager.getMouseHover.chunk;
      const { error, success } = await EntityManager.createEmptyChunk(chunk);
      if (!success) EngineDebugger.showError(error, "eventManager");
    }
  }
  private static brushEvents() {
    if (InputManager.onMouseDown("left")) this.brushSingleDrawEvent();
    else if (InputManager.onMouseDown("right")) this.brushShapeDrawEvent();
  }
  private static eraserEvents() {
    if (InputManager.onMouseDown("left")) this.singleEraseEvent();
    else if (InputManager.onMouseDown("right")) this.shapeEraseEvent();
  }
  private static lifterEvents() {
    const layers = Link.get<LayersLevel>("layer")();
    const active = Link.get<LutType>("activeLUT")();
    if (InputManager.onMouseClick("left")) this.liftUpEvent(active, layers);
    else if (InputManager.onMouseClick("right"))
      this.liftDownEvent(active, layers);
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
  private static liftUpEvent(lutType: LutType, layers: LayersLevel) {
    //JAK TO ZROBIC DLA TILE I STRUCT?!
    //TODO: zrobic tu jakis cache typu debounce bo zazwyczaj bedziesz chcial podniesc/opuscic o wiecej niz 1 naraz wic nie ma co kazdy klik szukac tego smaego layeru
    const tile = EntityManager.getTileFromMouse();
    if (!tile) return;
    if (lutType === "tile") {
      const layer = tile.tileLayers.find(
        (layer) => layer.layerIndex === layers.tile
      );
      if (!layer) return;
      layer.zIndex++;
    } else {
      const layer = tile.structureLayers.find(
        (layer) => layer.layerIndex === layers.structure
      );
      if (!layer) return;
      layer.zIndex++;
    }
    saveChunkOnChange(tile.chunkIndex);
  }
  private static liftDownEvent(lutType: LutType, layers: LayersLevel) {
    const tile = EntityManager.getTileFromMouse();
    if (!tile) return;
    if (lutType === "tile") {
      const layer = tile.tileLayers.find(
        (layer) => layer.layerIndex === layers.tile
      );
      if (!layer) return;
      layer.zIndex--;
    } else {
      const layer = tile.structureLayers.find(
        (layer) => layer.layerIndex === layers.structure
      );
      if (!layer) return;
      layer.zIndex--;
    }
    saveChunkOnChange(tile.chunkIndex);
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
    const config = getConfig();
    const { structure: layerIndex } = Link.get<LayersLevel>("layer")();
    const tile = EntityManager.getTileFromMouse();
    if (!tile) return;
    const anchorTile = EntityManager.getOffsetStructTile(
      tile,
      item,
      item.anchorTile,
      config
    );
    if (!anchorTile) return;
    anchorTile.addStructLayer({
      item,
      layerIndex,
      zIndex,
    });
    for (const collider of item.colliderTiles) {
      if (collider === item.anchorTile) continue;
      const collierTile = EntityManager.getOffsetStructTile(
        tile,
        item,
        collider,
        config
      );
      collierTile?.addDecorativeLayer({
        layerIndex,
        lutID: item.id,
        structureIndex: collider,
        viewID: item.viewID,
      });
    }

    saveChunkOnChange(anchorTile.chunkIndex);
  }
  private static addButchTiles() {}
  private static addBatchStructs() {}
  private static removeTile() {
    const { tile: layerIndex } = Link.get<LayersLevel>("layer")();
    const tile = EntityManager.getTileFromMouse();
    if (!tile) return;
    tile.removeTileLayer(layerIndex);
    //TODO: zamiast zapisywac co kazda zmiana kafla moze lepiej co X ms?
    //np tagowac ze chunk wymaga zmiany i za X sekund to zrobic jesli nie ma przy nim aktywnosci zadnej wiekszej (debounce)
    saveChunkOnChange(tile.chunkIndex);
  }

  private static removeStruct() {
    const config = getConfig();

    const { structure: layerIndex } = Link.get<LayersLevel>("layer")();
    const tile = EntityManager.getTileFromMouse();
    if (!tile) return;
    const layer = tile.structureLayers.find(
      (layer) => layer.layerIndex === layerIndex
    );
    if (!layer) return;
    console.log(layer);
    const itemData = AssetsManager.getItem("structure", layer.lutID);
    if (!itemData) return;
    const item = itemData.item;
    const anchorTile = EntityManager.getOffsetStructTile(
      tile,
      item,
      layer.structureIndex,
      config
    );
    anchorTile?.removeStructLayer(layerIndex);
    for (const collider of item.colliderTiles) {
      if (collider === item.anchorTile) continue;

      const collTile = EntityManager.getOffsetStructTile(
        tile,
        item,
        collider,
        config
      );
      collTile?.removeStructLayer(layerIndex);
    }
    saveChunkOnChange(tile.chunkIndex);
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
