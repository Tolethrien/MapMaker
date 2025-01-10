import Draw from "@/engine/core/aurora/urp/draw";
import InputManager from "@/engine/core/modules/inputManager";
import Entity from "../core/entity";
import { ProjectConfig } from "../core/entityManager";
import { saveOnChange } from "@/API/project";
import GlobalStore from "../../modules/globalStore";
import Link from "@/vault/link";
import Vec4D from "@/math/vec4D";
import { TextureViewSelected } from "@/API/links";
interface TileProps {
  pos: { x: number; y: number };
  color: HSLA;
  tileIndex: number;
  chunkIndex: number;
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

export default class Tile extends Entity {
  private static EMPTY_TILE_COLOR = new Uint8ClampedArray([255, 255, 255]);
  transform: TypeOfComponent<"Transform">;
  mouseEvent: TypeOfComponent<"MouseEvents">;
  color: HSLA;
  tileIndex: number;
  chunkIndex: number;
  crop: Position2D | undefined;
  constructor({ pos, color, chunkIndex, tileIndex }: TileProps) {
    const config = Link.get<ProjectConfig>("projectConfig")();

    super();
    this.crop = undefined;
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
    this.tileIndex = tileIndex;
    this.chunkIndex = chunkIndex;
    this.color = color;
    this.mouseEvent = this.addComponent("MouseEvents", {
      leftClick: (e) => {
        const a = Link.get<TextureViewSelected>("textureViewSelected");
        this.crop = { x: a().x, y: a().y };
        console.log(this.crop);
        // if (e.shift) this.color = [0, 0, 0, 255];
        // else this.color = [50, 50, 50, 255];
        //TODO: to powinno sie tylko wykonywac z flaga z projektu autosave
        // saveOnChange(chunkIndex);
      },
      rightClick: () => {
        this.color = [255, 255, 255, 255];
        // saveOnChange(chunkIndex);
      },
    });
  }
  update() {}
  render(): void {
    if (!this.crop) {
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
        tint: new Uint8ClampedArray([0, 0, 0]),
      });
    } else {
      Draw.Quad({
        alpha: 255,
        bloom: 0,
        crop: new Float32Array([
          this.crop.x / 1025,
          this.crop.y / 640,
          (this.crop.x + 16) / 1025,
          (this.crop.y + 16) / 640,
        ]),
        isTexture: 1,
        position: {
          x: this.transform.position.x,
          y: this.transform.position.y,
        },
        size: {
          w: this.transform.size.x,
          h: this.transform.size.y,
        },
        textureToUse: 1,
        tint: new Uint8ClampedArray([255, 255, 255]),
      });
    }
  }
  public isMouseCollide(mousePos: Position2D) {
    const normalizedMouse = InputManager.mouseToWorld(mousePos);
    return (
      normalizedMouse.x >= this.transform.position.x - this.transform.size.x &&
      normalizedMouse.x <= this.transform.position.x + this.transform.size.x &&
      normalizedMouse.y >= this.transform.position.y - this.transform.size.y &&
      normalizedMouse.y <= this.transform.position.y + this.transform.size.y
    );
  }
}
