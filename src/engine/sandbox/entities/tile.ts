import Entity from "@/engine/core/entity";
import Engine from "@/engine/engine";
import Transform from "@/engine/sandbox/components/transform";

export default class Tile extends Entity {
  transform: Transform;
  constructor() {
    super();
    this.transform = this.addComponent("Transform", {
      position: { x: 0, y: Math.random() * 500 },
    });
  }
  update() {
    this.transform.position = this.transform.position.add([3, 0]);
    if (this.transform.position.x > 800) {
      console.log("removed ID: ", this.getID);
      Engine.removeEntity(this.getID);
    }
  }
}
