import Link from "@/utils/link";
import Entity from "../core/entity";
import Draw from "../../aurora/urp/draw";
import InputManager from "../../modules/inputManager";
interface Props {
  index: number;
  position: Position2D;
}
export default class HollowChunk extends Entity {
  private transform: TypeOfComponent<"Transform">;
  private chunkIndex: number;
  constructor({ index, position }: Props) {
    super();
    const size = Link.get<ProjectConfig>("projectConfig")().chunkSizeInPixels;
    this.chunkIndex = index;
    this.transform = this.addComponent("Transform", {
      position,
      size: { width: size.w, height: size.h },
    });
  }
  update() {
    if (InputManager.onMouseClick("left") && this.isMouseCollide())
      console.log("click", this.chunkIndex);
  }
  render() {
    Draw.Quad({
      alpha: 25,
      bloom: 0,
      crop: new Float32Array([0, 0, 1, 1]),
      isTexture: 0,
      position: {
        x: this.transform.position.x + this.transform.size.x * 0.5,
        y: this.transform.position.y + this.transform.size.y * 0.5,
      },
      size: {
        w: this.transform.size.x * 0.5,
        h: this.transform.size.y * 0.5,
      },
      textureToUse: 0,
      tint: new Uint8ClampedArray([255, 255, 255]),
    });
    Draw.Text({
      alpha: 255,
      bloom: 0,
      position: this.transform.position.add([10, 10]).get,
      color: new Uint8ClampedArray([0, 0, 0]),
      fontFace: "roboto",
      fontSize: 40,
      text: `chunk: ${this.chunkIndex}`,
    });
  }
  public isMouseCollide() {
    const mousePos = InputManager.getMousePosition();
    return (
      mousePos.x >= this.transform.position.x &&
      mousePos.x <= this.transform.position.x + this.transform.size.x &&
      mousePos.y >= this.transform.position.y &&
      mousePos.y <= this.transform.position.y + this.transform.size.y
    );
  }
}
