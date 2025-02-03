import Vec2D from "@/math/vec2D";
import InputManager from "../../modules/inputManager";

export default abstract class Entity {
  position: Vec2D;
  size: Vec2D;
  // rotation: number;
  // anchorPoint: Vec2D;
  abstract update(): void;
  abstract render(): void;
  constructor(position: Position2D, size: Size2D) {
    this.position = Vec2D.create([position.x, position.y]);
    this.size = Vec2D.create([size.w, size.h]);
    // this.rotation = 0;
    // this.anchorPoint = Vec2D.create();
  }
  public isMouseCollide() {
    const mousePos = InputManager.getMousePosition();
    return (
      mousePos.x >= this.position.x - this.size.x &&
      mousePos.x <= this.position.x + this.size.x &&
      mousePos.y >= this.position.y - this.size.y &&
      mousePos.y <= this.position.y + this.size.y
    );
  }

  public isCameraCollide(cameraPos: Position2D) {
    return (
      cameraPos.x >= this.position.x - this.size.x &&
      cameraPos.x <= this.position.x + this.size.x &&
      cameraPos.y >= this.position.y - this.size.y &&
      cameraPos.y <= this.position.y + this.size.y
    );
  }
}
