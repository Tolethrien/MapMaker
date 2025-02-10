import Draw from "@/engine/core/aurora/urp/draw";
import InputManager from "@/engine/core/modules/inputManager";
import Entity from "../core/entity";
import Link from "@/utils/link";
import { PassManifold, Selectors } from "@/preload/globalLinks";
import Engine from "@/engine/engine";
import GlobalStore from "../../modules/globalStore";
import EntityManager from "../core/entityManager";
import AssetsManager from "@/utils/assetsManger";
interface TileProps {
  pos: { x: number; y: number };
  tileIndex: number;
  chunkIndex: number;
  layers: TileLayer[];
}
export interface TileLayer {
  color: HSLA;
  layerIndex: number;
  zIndex: number;
  textureID: string;
  tileID: number;
  crop: Position2D;
  tileSize: Size2D;
}
export interface TileTemplate {
  index: number;
  collider: 0 | 1;
  layers: TileLayer[];
}

export default class Tile extends Entity {
  tileIndex: number;
  chunkIndex: number;
  layers: TileLayer[];
  changedFlag: boolean;

  constructor({ pos, chunkIndex, tileIndex, layers }: TileProps) {
    const config = Link.get<ProjectConfig>("projectConfig")();
    super(
      {
        x: pos.x + config.tileSize.w * 0.5,
        y: pos.y + config.tileSize.h * 0.5,
      },
      {
        w: config.tileSize.w * 0.5,
        h: config.tileSize.h * 0.5,
      }
    );
    this.layers = layers;
    this.tileIndex = tileIndex;
    this.chunkIndex = chunkIndex;
    this.changedFlag = false;
  }
  onEvent(): void {
    const selector = Link.get<Selectors>("activeSelector")();
    if (selector === "tile") this.tileEvents();
    if (selector === "layer") this.layerEvent();
    else if (selector === "brush") this.brushEvents();
  }
  onUpdate() {}

  onRender(): void {
    if (this.layers.length === 0) return;
    const isLayer = Link.get<boolean>("singleLayerMode")();
    if (isLayer) this.drawIndexedLayer();
    else this.drawLayers();
  }

  private drawLayers() {
    this.layers.forEach((layer) => {
      this.drawLayer(layer);
    });
  }
  private drawIndexedLayer() {
    const indexLayer = Link.get<number>("layer")();

    const layer = this.layers.find((layer) => layer.layerIndex === indexLayer);
    if (layer === undefined) return;
    this.drawLayer(layer);
  }
  private drawLayer(layer: TileLayer) {
    const textureID = AssetsManager.getTextureIndexFromID(layer.textureID);
    if (!textureID) return;
    const size = Draw.getTextureMeta();
    const opacity = this.getOpacity(layer);
    if (opacity <= 0) return;
    const crop = new Float32Array([
      layer.crop.x / size.width,
      layer.crop.y / size.height,
      (layer.crop.x + layer.tileSize.w) / size.width,
      (layer.crop.y + layer.tileSize.h) / size.height,
    ]);
    Draw.Quad({
      alpha: opacity,
      bloom: 0,
      crop: crop,
      isTexture: 1,
      position: {
        x: this.position.x,
        y: this.position.y - layer.zIndex,
      },
      size: {
        w: this.size.x,
        h: this.size.y,
      },
      textureToUse: textureID,
      tint: new Uint8ClampedArray(layer.color),
    });
  }
  private tileEvents() {
    if (InputManager.onMouseClick("left") && this.isMouseCollide()) {
      console.log(this);
    }
  }
  private brushEvents() {
    const mouseCollider = this.isMouseCollide();

    if (this.changedFlag === true && !mouseCollider) {
      this.changedFlag = false;
      return;
    }
    if (this.changedFlag) return;
    if (!mouseCollider) return;

    if (InputManager.onMouseDown("left")) this.mouseBrushLeft();
    else if (InputManager.onMouseDown("right")) this.mouseBrushRight();
  }
  private layerEvent() {
    const layerIndex = Link.get<number>("layer")();
    let event: "left" | "right" | undefined = undefined;

    if (InputManager.onMouseClick("left")) event = "left";
    else if (InputManager.onMouseClick("right")) event = "right";

    if (event === undefined) return;
    if (!this.isMouseCollide()) return;

    const layer = this.layers.find((layer) => layer.layerIndex === layerIndex);
    if (!layer) return;

    event === "left" ? layer.zIndex++ : layer.zIndex--;

    EntityManager.saveOnChange(this.chunkIndex);
  }
  private mouseBrushLeft() {
    const [getter] = GlobalStore.get<PassManifold>("passManifold");
    const layerIndex = Link.get<number>("layer")();
    const zIndex = Link.get<number>("z-index")();
    const layer: TileLayer = {
      color: [255, 255, 255, 255] as HSLA,
      crop: { x: getter.gridPos.x, y: getter.gridPos.y },
      textureID: getter.textureID,
      tileID: getter.tileCropIndex,
      layerIndex: layerIndex,
      zIndex: zIndex,
      tileSize: getter.tileSize,
    };
    // TODO: zoptymalizowac to, jako ze layers to praktycznie zawsze posortowana lista numerow, jakis algo by wszedł
    const index = this.layers.findIndex(
      (layer) => layer.layerIndex === layerIndex
    );
    if (index !== -1) this.layers[index] = layer;
    else {
      this.layers.push(layer);
      this.layers.sort((a, b) => a.layerIndex - b.layerIndex);
    }
    //TODO: zamiast zapisywac co kazda zmiana kafla moze lepiej co X ms?
    //np tagowac ze chunk wymaga zmiany i za X sekund to zrobic jesli nie ma przy nim aktywnosci zadnej wiekszej
    EntityManager.saveOnChange(this.chunkIndex);
    this.changedFlag = true;
  }
  private mouseBrushRight() {
    const layerIndex = Link.get<number>("layer")();
    const index = this.layers.findIndex(
      (layer) => layer.layerIndex === layerIndex
    );
    if (index === -1) return;
    this.layers.splice(index, 1);
    EntityManager.saveOnChange(this.chunkIndex);
    this.changedFlag = true;
  }

  private getOpacity(layer: TileLayer) {
    const globalOpacity = EntityManager.getLayerVis(layer.layerIndex);
    return (globalOpacity * layer.color[3] + 127) >> 8;
  }
}
