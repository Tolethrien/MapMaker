import Link from "@/utils/link";
import Entity from "../core/entity";
import Draw from "../../aurora/urp/draw";
import InputManager from "../../modules/inputManager";
import EventBus from "@/utils/eventBus";
import EntityManager from "../core/entityManager";
interface Props {
  index: number;
  position: Position2D;
}
export default class HollowChunk extends Entity {
  private chunkIndex: number;
  constructor({ index, position }: Props) {
    const size = Link.get<ProjectConfig>("projectConfig")().chunkSizeInPixels;
    super(position, { w: size.w, h: size.h });
    this.chunkIndex = index;

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
        x: this.position.x + this.size.x * 0.5,
        y: this.position.y + this.size.y * 0.5,
      },
      size: {
        w: this.size.x * 0.5,
        h: this.size.y * 0.5,
      },
      textureToUse: 0,
      tint: new Uint8ClampedArray([255, 255, 255]),
    });
    Draw.Text({
      alpha: 255,
      bloom: 0,
      position: this.position.add([10, 10]).get,
      color: new Uint8ClampedArray([255, 255, 255]),
      fontFace: "roboto",
      fontSize: 40,
      text: `chunk: ${this.chunkIndex}`,
    });
  }
}
