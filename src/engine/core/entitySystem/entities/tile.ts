import Draw from "@/engine/core/aurora/urp/draw";
import InputManager from "@/engine/core/modules/inputManager";
import Entity from "../core/entity";
import Link from "@/utils/link";
import { PassManifold } from "@/preload/globalLinks";
import { randomColor } from "@/utils/utils";
import Engine from "@/engine/engine";
import GlobalStore from "../../modules/globalStore";
import EntityManager from "../core/entityManager";
interface TileProps {
  pos: { x: number; y: number };
  tileIndex: number;
  chunkIndex: number;
  layers: TileLayer[];
}
export interface TileLayer {
  color: HSLA;
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
  private static EMPTY_TILE_COLOR = new Uint8ClampedArray(randomColor());
  transform: TypeOfComponent<"Transform">;
  mouseEvent: TypeOfComponent<"MouseEvents">;
  tileIndex: number;
  chunkIndex: number;
  layers: TileLayer[];
  changedFlag: boolean;

  constructor({ pos, chunkIndex, tileIndex, layers }: TileProps) {
    const config = Link.get<ProjectConfig>("projectConfig")();

    super();
    this.transform = this.addComponent("Transform", {
      position: {
        x: pos.x + config.tileSize.w * 0.5,
        y: pos.y + config.tileSize.h * 0.5,
      },
      size: {
        width: config.tileSize.w * 0.5,
        height: config.tileSize.h * 0.5,
      },
    });
    this.layers = layers;
    this.tileIndex = tileIndex;
    this.chunkIndex = chunkIndex;
    this.changedFlag = false;
  }
  update() {
    this.mouseEvents();
  }
  render(): void {
    if (this.layers.length > 0) this.drawLayers();
    else this.drawEmpty();
  }

  private drawLayers() {
    this.layers.forEach((layer) => {
      const textureID = Engine.TexturesIDs.get(layer.textureID);
      if (!textureID) return;
      const size = Draw.getTextureMeta();
      const crop = new Float32Array([
        layer.crop.x / size.width,
        layer.crop.y / size.height,
        (layer.crop.x + layer.tileSize.w) / size.width,
        (layer.crop.y + layer.tileSize.h) / size.height,
      ]);
      Draw.Quad({
        alpha: layer.color[3],
        bloom: 0,
        crop: crop,
        isTexture: 1,
        position: {
          x: this.transform.position.x,
          y: this.transform.position.y,
        },
        size: {
          w: this.transform.size.x,
          h: this.transform.size.y,
        },
        textureToUse: textureID,
        tint: new Uint8ClampedArray(layer.color),
      });
    });
  }
  private drawEmpty() {
    Draw.Quad({
      alpha: 255,
      bloom: 0,
      crop: new Float32Array([0, 0, 1, 1]),
      isTexture: 0,
      position: {
        x: this.transform.position.x,
        y: this.transform.position.y,
      },
      size: {
        w: this.transform.size.x,
        h: this.transform.size.y,
      },
      textureToUse: 0,
      tint: Tile.EMPTY_TILE_COLOR,
    });
  }
  private mouseEvents() {
    const mousePos = InputManager.getMousePosition();

    if (this.changedFlag === true && !this.isMouseCollide(mousePos)) {
      this.changedFlag = false;
      return;
    }
    if (this.changedFlag) return;

    this.onMouseLeft(mousePos);
    this.onMouseRight(mousePos);
  }
  private onMouseLeft(mousePos: Position2D) {
    if (InputManager.onMouseDown("left") && this.isMouseCollide(mousePos)) {
      const [getter] = GlobalStore.get<PassManifold>("passManifold");
      const zIndex = Link.get<number>("z-index")();
      const layer = {
        color: [255, 255, 255, 255] as HSLA,
        crop: { x: getter.gridPos.x, y: getter.gridPos.y },
        textureID: getter.textureID,
        tileID: getter.tileCropIndex,
        zIndex: zIndex,
        tileSize: getter.tileSize,
      };
      // TODO: zoptymalizowac to, jako ze layers to praktycznie zawsze posortowana lista numerow, jakis algo by wszedł
      const index = this.layers.findIndex((layer) => layer.zIndex === zIndex);
      if (index !== -1) this.layers[index] = layer;
      else {
        this.layers.push(layer);
        this.layers.sort((a, b) => a.zIndex - b.zIndex);
      }
      //TODO: zamiast zapisywac co kazda zmiana kafla moze lepiej co X ms?
      //np tagowac ze chunk wymaga zmiany i za X sekund to zrobic jesli nie ma przy nim aktywnosci zadnej wiekszej
      EntityManager.saveOnChange(this.chunkIndex);
      this.changedFlag = true;
    }
  }
  private onMouseRight(mousePos: Position2D) {
    if (InputManager.onMouseDown("right") && this.isMouseCollide(mousePos)) {
      const zIndex = Link.get<number>("z-index")();
      const index = this.layers.findIndex((layer) => layer.zIndex === zIndex);
      if (index === -1) return;
      this.layers.splice(index, 1);
      EntityManager.saveOnChange(this.chunkIndex);
      this.changedFlag = true;
    }
  }
  private isMouseCollide(position: Position2D) {
    return (
      position.x >= this.transform.position.x - this.transform.size.x &&
      position.x <= this.transform.position.x + this.transform.size.x &&
      position.y >= this.transform.position.y - this.transform.size.y &&
      position.y <= this.transform.position.y + this.transform.size.y
    );
  }
}
