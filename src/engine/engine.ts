import Aurora from "./core/aurora/auroraCore";
import Draw from "./core/aurora/urp/draw";
import Entity from "./core/entitySys/entity";

export default class Engine {
  private static canvas: HTMLCanvasElement;
  private static entities: Map<string, Entity> = new Map();
  public static async initialize(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    await Aurora.initialize(canvas); // needs to be before preload
    Aurora.setFirstAuroraFrame();

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

  private static loop() {
    requestAnimationFrame(() => this.loop());
  }
}
