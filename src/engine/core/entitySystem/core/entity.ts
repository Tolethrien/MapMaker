import Vec2D from "@/math/vec2D";
import { LutType } from "../../modules/assetsManager";

export default abstract class Entity {
  position: Vec2D;
  size: Vec2D;
  abstract onUpdate(): void;
  abstract onRender(lutType: LutType): void;
  constructor(position: Position2D, size: Size2D) {
    this.position = Vec2D.create([position.x, position.y]);
    this.size = Vec2D.create([size.w, size.h]);
  }
}
