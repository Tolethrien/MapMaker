import Draw from "@/engine/core/aurora/urp/draw";
import Entity from "../core/entity";
import AssetsManager, {
  LutType,
  StructureLUTItem,
  TileLUTItem,
} from "@/engine/core/modules/assetsManager";

import EngineDebugger from "../../modules/debugger";
import { getConfig } from "@/utils/utils";
import EntityManager from "../core/entityManager";
import Link from "@/utils/link";
import { LayersLevel, MapMods, MapView } from "@/preload/globalLinks";
interface TileProps {
  pos: { x: number; y: number };
  tileIndex: number;
  chunkIndex: number;
  tileLayers: BaseTileLayer[];
  structureLayers: BaseStructureLayer[];
  collider: boolean;
}
export type BaseTileLayer = {
  // in: tile
  layerIndex: number;
  lutID: string;
  lutType: LutType;
  zIndex: number;
};
export interface BaseStructureLayer extends BaseTileLayer {
  decorative: boolean;
  structureIndex: number;
}
interface TileLayer extends BaseTileLayer {
  //in tile
  crop: Box2D;
  color: Uint8ClampedArray;
  viewID: string; // to check is view still there and render or not to screen, and to get textureIndex
}
interface StructureLayer extends BaseStructureLayer {
  //in tile
  crop: Box2D;
  boxOffset: Box2D;
  color: Uint8ClampedArray;
  viewID: string; // to check is view still there and render or not to screen, and to get textureIndex
}

interface LayerProps {
  item: StructureLUTItem | TileLUTItem;
  layerIndex: number;
  zIndex: number;
}

interface DecorativeLayerProps {
  viewID: string;
  lutID: string;
  layerIndex: number;
  structureIndex: number;
}

export default class Tile extends Entity {
  collider: boolean;
  index: number;
  tileLayers: TileLayer[];
  structureLayers: StructureLayer[];
  chunkIndex: number;
  colliderSet: Set<number>;

  constructor({
    pos,
    chunkIndex,
    tileIndex,
    structureLayers,
    tileLayers,
    collider,
  }: TileProps) {
    //TODO: pass this, no need to access on each tile
    const config = getConfig();
    super(pos, config.tileSize);
    this.index = tileIndex;
    this.chunkIndex = chunkIndex;
    this.collider = collider;
    this.colliderSet = new Set();
    this.tileLayers = this.convertBaseTileToLayer(tileLayers);
    this.structureLayers = this.convertBaseStructToLayer(structureLayers);
    if (this.colliderSet.size > 0) this.collider = true;
  }

  onUpdate() {}
  onRender(type: LutType): void {
    const mapView = Link.get<MapView>("mapView")();
    const currentLayerIndex = Link.get<LayersLevel>("layer")();
    if (type === "tile") this.renderTile(mapView, currentLayerIndex.tile);
    else this.renderStruct(mapView, currentLayerIndex.structure);
  }
  private renderTile(view: MapView, layerIndex: number) {
    if (view === "singleStruct") return;
    this.tileLayers.forEach((layer) => {
      this.drawTileLayer(layer, view, layerIndex);
    });
  }
  private renderStruct(view: MapView, layerIndex: number) {
    if (view == "singleTile") return;
    this.structureLayers.forEach((layer) => {
      this.drawStructLayer(layer, view, layerIndex);
    });
  }

  private drawTileLayer(layer: TileLayer, view: MapView, layerIndex: number) {
    if (view === "singleTile" && layerIndex !== layer.layerIndex) return;
    const textureIndex = AssetsManager.getTextureIndexFromLUT(
      layer.lutType,
      layer.lutID
    );
    if (!textureIndex) return;
    const crop = Draw.calculateCrop(layer.crop); // zmienic to przy refaktorze aurory
    const alpha = this.getOpacity("tile", layer);
    Draw.Quad({
      alpha: alpha,
      bloom: 0,
      crop: crop,
      isTexture: 1,
      position: { x: this.position.x, y: this.position.y - layer.zIndex },
      size: { w: this.size.x, h: this.size.y },
      textureToUse: textureIndex,
      tint: layer.color,
    });
  }
  private drawStructLayer(
    layer: StructureLayer,
    view: MapView,
    layerIndex: number
  ) {
    if (layer.lutType === "structure" && layer.decorative) return;
    if (view === "singleStruct" && layerIndex !== layer.layerIndex) return;
    const textureIndex = AssetsManager.getTextureIndexFromLUT(
      layer.lutType,
      layer.lutID
    );
    if (!textureIndex) return;
    const crop = Draw.calculateCrop(layer.crop); // zmienic to przy refaktorze aurory
    const alpha = this.getOpacity("structure", layer);
    Draw.Quad({
      alpha: alpha,
      bloom: 0,
      crop: crop,
      isTexture: 1,
      position: {
        x: this.position.x + layer.boxOffset.x,
        y: this.position.y + layer.boxOffset.y - layer.zIndex,
      },
      size: layer.boxOffset,
      textureToUse: textureIndex,
      tint: layer.color,
    });
  }
  public drawCollider() {
    if (!this.collider) return;
    Draw.Quad({
      alpha: 150,
      bloom: 0,
      crop: new Float32Array([0, 0, 0, 0]),
      isTexture: 0,
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      size: {
        w: this.size.x,
        h: this.size.y,
      },
      textureToUse: 0,
      tint: new Uint8ClampedArray([255, 255, 255]),
    });
  }
  public addDecorativeLayer({
    lutID,
    viewID,
    layerIndex,
    structureIndex,
  }: DecorativeLayerProps) {
    const layer: StructureLayer = {
      color: new Uint8ClampedArray([255, 255, 255]),
      crop: { h: 0, w: 0, x: 0, y: 0 },
      boxOffset: { x: 0, y: 0, w: 0, h: 0 },
      viewID,
      lutID,
      lutType: "structure",
      decorative: true,
      layerIndex,
      zIndex: 0,
      structureIndex: structureIndex,
    };
    const index = this.structureLayers.findIndex(
      (layer) => layer.layerIndex === layerIndex
    );
    if (index !== -1) this.structureLayers[index] = layer;
    else {
      this.structureLayers.push(layer);
      this.structureLayers.sort((a, b) => a.layerIndex - b.layerIndex);
    }
    this.colliderSet.add(layerIndex);
    this.collider = true;
  }
  public addStructLayer({ item, layerIndex, zIndex }: LayerProps) {
    EngineDebugger.assertCondition("boxOffset" in item);
    const layer: StructureLayer = {
      color: new Uint8ClampedArray([255, 255, 255]),
      crop: item.crop,
      boxOffset: item.boxOffset,
      viewID: item.viewID,
      lutID: item.id,
      lutType: "structure",
      decorative: false,
      layerIndex,
      zIndex,
      structureIndex: item.anchorTile,
    };

    const index = this.structureLayers.findIndex(
      (layer) => layer.layerIndex === layerIndex
    );
    if (index !== -1) this.structureLayers[index] = layer;
    else {
      this.structureLayers.push(layer);
      this.structureLayers.sort((a, b) => a.layerIndex - b.layerIndex);
    }
    const isCollide = item.colliderTiles.find(
      (tile) => tile === item.anchorTile
    );
    if (isCollide === undefined) return;
    this.colliderSet.add(layerIndex);
    this.collider = true;
  }
  public addTileLayer({ item, layerIndex, zIndex }: LayerProps) {
    EngineDebugger.assertCondition(!("boxOffset" in item));
    const layer: TileLayer = {
      color: new Uint8ClampedArray([255, 255, 255, 255]),
      crop: item.crop,
      layerIndex: layerIndex,
      zIndex: zIndex,
      lutID: item.id,
      lutType: "tile",
      viewID: item.viewID,
    };
    const index = this.tileLayers.findIndex(
      (layer) => layer.layerIndex === layerIndex
    );
    if (index !== -1) this.tileLayers[index] = layer;
    else {
      this.tileLayers.push(layer);
      this.tileLayers.sort((a, b) => a.layerIndex - b.layerIndex);
    }
    if (!item.collider) return;
    this.colliderSet.add(layerIndex);
    this.collider = true;
  }
  public removeTileLayer(layerIndex: number) {
    const index = this.tileLayers.findIndex(
      (layer) => layer.layerIndex === layerIndex
    );
    if (index === -1) return;
    this.tileLayers.splice(index, 1);
    if (!this.collider) return;
    this.colliderSet.delete(layerIndex);
    if (this.colliderSet.size === 0) this.collider = false;
  }
  public removeStructLayer(layerIndex: number) {
    const index = this.structureLayers.findIndex(
      (layer) => layer.layerIndex === layerIndex
    );
    if (index === -1) return;
    this.structureLayers.splice(index, 1);
    if (!this.collider) return;
    this.colliderSet.delete(layerIndex);
    if (this.colliderSet.size === 0) this.collider = false;
  }

  private getOpacity(type: LutType, layer: TileLayer) {
    const globalOpacity = EntityManager.getLayerVis(type, layer.layerIndex);
    //REWORK: nie mam jescze koloru w LUT a dokladniej alphy - zmien 255
    return (globalOpacity * 255 + 127) >> 8;
  }
  private convertBaseTileToLayer(layers: BaseTileLayer[]) {
    return layers
      .map((layer) => {
        const data = AssetsManager.getItem("tile", layer.lutID);
        if (!data) return;
        if (data.item.collider) this.colliderSet.add(layer.layerIndex);
        return {
          ...layer,
          color: new Uint8ClampedArray([255, 255, 255]),
          crop: data.item.crop,
          viewID: data.view.id,
        };
      })
      .filter(Boolean) as TileLayer[];
  }
  private convertBaseStructToLayer(layers: BaseStructureLayer[]) {
    return layers
      .map((layer) => {
        const data = AssetsManager.getItem("structure", layer.lutID);
        if (!data) return;
        if (data.item.colliderTiles.includes(layer.structureIndex))
          this.colliderSet.add(layer.layerIndex);
        return {
          ...layer,
          color: new Uint8ClampedArray([255, 255, 255]),
          crop: data.item.crop,
          boxOffset: "boxOffset" in data.item ? data.item.boxOffset : undefined,
          viewID: data.view.id,
        };
      })
      .filter(Boolean) as StructureLayer[];
  }
}
