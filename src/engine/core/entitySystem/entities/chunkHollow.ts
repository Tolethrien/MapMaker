import Link from "@/utils/link";
import Entity from "../core/entity";
import Draw from "../../aurora/urp/draw";
import InputManager from "../../modules/inputManager";
import EventBus from "@/utils/eventBus";
import EntityManager from "../core/entityManager";
import { randomColor } from "@/utils/utils";
interface Props {
  index: number;
  position: Position2D;
}
export default class HollowChunk extends Entity {
  private chunkIndex: number;
  private hollowColor: HSLA;
  public gridPosition: Position2D;

  constructor({ index, position }: Props) {
    const size = Link.get<ProjectConfig>("projectConfig")().chunkSizeInPixels;
    super(
      {
        x: position.x + size.w * 0.5,
        y: position.y + size.h * 0.5,
      },
      { w: size.w * 0.5, h: size.h * 0.5 }
    );
    this.gridPosition = position;

    this.chunkIndex = index;
    this.hollowColor = randomColor();
    EventBus.on("cameraMove", {
      name: `chunk-${this.chunkIndex} move check`,
      callback: (event: Position2D) => {
        if (this.isCameraCollide(event) && !this.isCameraOnChunk())
          EntityManager.remap(this.chunkIndex, this.position.get);
      },
    });
  }
  update() {
    if (InputManager.onMouseClick("left") && this.isMouseCollide()) {
      console.log("click", this.chunkIndex);
      EntityManager.createEmptyChunk(this.chunkIndex);
    }
  }
  private isCameraOnChunk() {
    return EntityManager.getCameraOnChunk === this.chunkIndex;
  }

  render() {
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
      position: this.position.sub([80, 20]).get,
      color: new Uint8ClampedArray([255, 255, 255]),
      fontFace: "roboto",
      fontSize: 40,
      text: `chunk: ${this.chunkIndex}`,
    });
  }
}
