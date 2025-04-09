import Entity from "../core/entity";
import Draw from "../../aurora/urp/draw";
import { getConfig, randomColor } from "@/utils/utils";
interface Props {
  index: number;
  position: Position2D;
}
export default class HollowChunk extends Entity {
  public index: number;
  private hollowColor: HSLA;
  public gridPosition: Position2D;

  constructor({ index, position }: Props) {
    const size = getConfig().chunkSizeInPixels;
    super(
      {
        x: position.x,
        y: position.y,
      },
      { w: size.w, h: size.h }
    );
    this.gridPosition = position;

    this.index = index;
    this.hollowColor = randomColor();
  }
  public get getBox() {
    return {
      x: this.position.x,
      y: this.position.y,
      w: this.size.x,
      h: this.size.y,
    };
  }
  onUpdate() {}

  onRender() {
    Draw.Quad({
      alpha: 25,
      bloom: 0,
      crop: new Float32Array([0, 0, 1, 1]),
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
      tint: new Uint8ClampedArray(this.hollowColor),
    });
    Draw.Text({
      alpha: 255,
      bloom: 0,
      position: this.position.add([80, 20]).get,
      color: new Uint8ClampedArray([255, 255, 255]),
      fontFace: "roboto",
      fontSize: 40,
      text: `chunk: ${this.index}`,
    });
  }
}
