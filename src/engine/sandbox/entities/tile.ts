import Draw from "@/engine/core/aurora/urp/draw";
import Entity from "@/engine/core/entitySys/entity";
import { TypeOfComponent } from "@/types/types";
interface TileProps {
  pos: { x: number; y: number };
  size: { w: number; h: number };
}
export default class Tile extends Entity {
  transform: TypeOfComponent<"Transform">;
  mouseEvent: TypeOfComponent<"MouseEvents">;
  constructor({ pos, size }: TileProps) {
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
    this.mouseEvent = this.addComponent("MouseEvents", {
      leftClick: (e) => {
        if (e.shift) this.col = [0, 0, 0];
        else this.col = [50, 50, 50];
      },
      rightClick: () => (this.col = [255, 255, 255]),
    });
    this.col = [Math.random() * 255, Math.random() * 255, Math.random() * 255];
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
      tint: new Uint8ClampedArray(this.col),
    });
  }
}
