import Entity from "./core/entity";

export default class Engine {
  private static canvas: HTMLCanvasElement;
  private static ctx: CanvasRenderingContext2D;
  private static entities: Map<string, Entity> = new Map();
  public static initialize(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.loop();
  }
  public static getEntities() {
    return this.entities;
  }
  public static addEntity(entity: Entity) {
    this.entities.set(entity.getID, entity);
  }
  public static removeEntity(entityID: Entity["id"]) {
    this.entities.delete(entityID);
  }

  private static draw = (x: number, y: number) => {
    this.ctx.beginPath();
    this.ctx.arc(x, y, 50, 0, 2 * Math.PI);
    this.ctx.fillStyle = "green";
    this.ctx.fill();
  };

  private static loop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.entities.forEach((entity) => {
      entity.update();
    });

    this.entities.forEach((entity) => {
      const transform = entity.getComponent("Transform");
      this.draw(transform.position.x, transform.position.y);
    });
    requestAnimationFrame(() => this.loop());
  }
}
