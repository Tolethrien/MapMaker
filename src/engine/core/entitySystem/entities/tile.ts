import Draw from "@/engine/core/aurora/urp/draw";
import GlobalStore from "@/engine/core/modules/globalStore/globalStore";
import InputManager from "@/engine/core/modules/inputManager/inputManager";
import Entity from "../core/entity";
import { ProjectConfig } from "../core/entityManager";
interface TileProps {
  pos: { x: number; y: number };
  color: HSLA;
  tileIndex: number;
  chunkIndex: number;
}
export default class Tile extends Entity {
  transform: TypeOfComponent<"Transform">;
  mouseEvent: TypeOfComponent<"MouseEvents">;
  color: HSLA;
  tileIndex: number;
  chunkIndex: number;
  constructor({ pos, color, chunkIndex, tileIndex }: TileProps) {
    const [config] = GlobalStore.get<ProjectConfig>("projectConfig");

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
    this.tileIndex = tileIndex;
    this.chunkIndex = chunkIndex;
    this.color = color;
    this.mouseEvent = this.addComponent("MouseEvents", {
      leftClick: (e) => {
        if (e.shift) this.color = [0, 0, 0, 255];
        else this.color = [50, 50, 50, 255];
        //TODO: to powinno sie tylko wykonywac z flaga z projektu autosave
        // saveProjectOnChange(chunkIndex, tileIndex);
      },

      rightClick: () => {
        this.color = [255, 255, 255, 255];
        // saveProjectOnChange(chunkIndex, tileIndex);
      },
    });
    // this.color = [Math.random() * 255, Math.random() * 255, Math.random() * 255];
  }
  update() {}
  render(): void {
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
      tint: new Uint8ClampedArray(this.color),
    });
  }
  public isMouseCollide(mousePos: Position2D) {
    const normalizedMouse = InputManager.mouseToWorld(mousePos);
    return (
      normalizedMouse.x >=
        this.transform.position.get.x - this.transform.size.get.x &&
      normalizedMouse.x <=
        this.transform.position.get.x + this.transform.size.get.x &&
      normalizedMouse.y >=
        this.transform.position.get.y - this.transform.size.get.y &&
      normalizedMouse.y <=
        this.transform.position.get.y + this.transform.size.get.y
    );
  }
}
