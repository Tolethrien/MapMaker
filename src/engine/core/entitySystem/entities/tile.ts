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
interface TileProps {
  pos: { x: number; y: number };
  tileIndex: number;
  chunkIndex: number;
  tileLayers: BaseTileLayer[];
  structureLayers: BaseStructureLayer[];
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
interface TileLayerProps {
  layer: TileLayer;
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

  constructor({
    pos,
    chunkIndex,
    tileIndex,
    structureLayers,
    tileLayers,
  }: TileProps) {
    //TODO: pass this, no need to access on each tile
    const config = getConfig();
    super(pos, config.tileSize);
    this.index = tileIndex;
    this.chunkIndex = chunkIndex;
    this.tileLayers = Tile.convertBaseTileToLayer(tileLayers);
    this.structureLayers = Tile.convertBaseStructToLayer(structureLayers);
    this.collider = false;
  }

  onUpdate() {}
  onRender(type: LutType): void {
    if (type === "tile") this.renderTile();
    else this.renderStruct();
  }
  private renderTile() {
    this.tileLayers.forEach((layer) => {
      this.drawTileLayer(layer);
    });
  }
  private renderStruct() {
    this.structureLayers.forEach((layer) => {
      this.drawStructLayer(layer);
    });
  }

  private drawTileLayer(layer: TileLayer) {
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
  private drawStructLayer(layer: StructureLayer) {
    if (layer.lutType === "structure" && layer.decorative) return;
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
  public drawColliders() {
    Draw.Quad({
      alpha: 100,
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
  }
  public removeTileLayer(layerIndex: number) {
    const index = this.tileLayers.findIndex(
      (layer) => layer.layerIndex === layerIndex
    );
    if (index === -1) return;
    this.tileLayers.splice(index, 1);
  }
  public removeStructLayer(layer: number) {
    this.structureLayers.splice(layer, 1);
  }

  private getOpacity(type: LutType, layer: TileLayer) {
    const globalOpacity = EntityManager.getLayerVis(type, layer.layerIndex);
    //REWORK: nie mam jescze koloru w LUT a dokladniej alphy - zmien 255
    return (globalOpacity * 255 + 127) >> 8;
  }
  private static convertBaseTileToLayer(layers: BaseTileLayer[]) {
    return layers
      .map((layer) => {
        const data = AssetsManager.getItem(layer.lutType, layer.lutID);
        if (!data) return;
        return {
          ...layer,
          color: new Uint8ClampedArray([255, 255, 255]),
          crop: data.item.crop,
          viewID: data.view.id,
        };
      })
      .filter(Boolean) as TileLayer[];
  }
  private static convertBaseStructToLayer(layers: BaseStructureLayer[]) {
    return layers
      .map((layer) => {
        const data = AssetsManager.getItem(layer.lutType, layer.lutID);
        if (!data) return;
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
