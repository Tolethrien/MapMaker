import { saveProjectOnChange } from "@/API/project";
import Draw from "@/engine/core/aurora/urp/draw";
import Entity from "@/engine/core/entitySys/entity";
interface TileProps {
  pos: { x: number; y: number };
  size: { w: number; h: number };
  color: number[];
  tileIndex: number;
  chunkIndex: number;
}
export default class Tile extends Entity {
  transform: TypeOfComponent<"Transform">;
  mouseEvent: TypeOfComponent<"MouseEvents">;
  color: number[];
  tileIndex: number;
  chunkIndex: number;
  constructor({ pos, size, color, chunkIndex, tileIndex }: TileProps) {
    super();
    this.transform = this.addComponent("Transform", {
      position: {
        x: pos.x + size.w * 0.5,
        y: pos.y + size.h * 0.5,
      },
      size: {
        width: size.w * 0.5,
        height: size.h * 0.5,
      },
    });
    this.tileIndex = tileIndex;
    this.chunkIndex = chunkIndex;
    this.color = color;
    this.mouseEvent = this.addComponent("MouseEvents", {
      leftClick: (e) => {
        if (e.shift) this.color = [0, 0, 0];
        else this.color = [50, 50, 50];
        //TODO: to powinno sie tylko wykonywac z flaga z projektu autosave
        saveProjectOnChange(chunkIndex, tileIndex);
      },

      rightClick: () => {
        this.color = [255, 255, 255];
        saveProjectOnChange(chunkIndex, tileIndex);
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
        width: this.transform.size.x,
        height: this.transform.size.y,
      },
      textureToUse: 0,
      tint: new Uint8ClampedArray(this.color),
    });
  }
}
