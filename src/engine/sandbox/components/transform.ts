import Component from "@/engine/core/entitySys/component";
import Vec2D from "@/math/vec2D";

export interface TransformProps {
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  rotation: number;
}

export default class Transform extends Component {
  position: Vec2D;
  size: Vec2D;
  rotation: TransformProps["rotation"];

  constructor({
    position = { x: 0, y: 0 },
    size = { width: 0, height: 0 },
    rotation = 0,
  }: Partial<TransformProps>) {
    super();
    this.position = new Vec2D([position.x, position.y]);
    this.size = new Vec2D([size.width, size.height]);
    this.rotation = rotation;
  }
}
