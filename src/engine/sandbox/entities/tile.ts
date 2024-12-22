import Draw from "@/engine/core/aurora/urp/draw";
import Entity from "@/engine/core/entitySys/entity";
import Engine from "@/engine/engine";
import Transform from "@/engine/sandbox/components/transform";

export default class Tile extends Entity {
  transform: Transform;
  constructor() {
    super();
    this.transform = this.addComponent("Transform", {
      position: { x: 1, y: 32 },
    });
  }
  update() {
    this.transform.position = this.transform.position.add([
      Math.random() * 3,
      0,
    ]);
    if (this.transform.position.x > 800) {
      console.log("removed ID: ", this.getID);
      Engine.removeEntity(this.getID);
    }
  }
  render(): void {
    Draw.Quad({
      alpha: 255,
      bloom: 0,
      crop: new Float32Array([0, 0, 1, 1]),
      isTexture: 0,
      position: { x: this.transform.position.x, y: this.transform.position.y },
      size: { width: 35, height: 35 },
      textureToUse: 0,
      tint: new Uint8ClampedArray([0, 255, 0]),
    });
  }
}
