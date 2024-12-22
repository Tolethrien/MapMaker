import Aurora from "./core/aurora/auroraCore";
import Batcher from "./core/aurora/urp/batcher";
import Draw from "./core/aurora/urp/draw";
import Entity from "./core/entitySys/entity";

export default class Engine {
  private static canvas: HTMLCanvasElement;
  private static entities: Map<string, Entity> = new Map();
  public static async initialize(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    await Aurora.initialize(canvas); // needs to be before preload
    await Batcher.createBatcher({
      backgroundColor: [0, 255, 0, 255],
      bloom: { active: false, str: 0 },
      customCamera: false,
      lighting: false,
    });

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
    Batcher.startBatch();
    this.entities.forEach((entity) => {
      entity.update();
    });
    this.entities.forEach((entity) => {
      entity.render();
    });
    Batcher.endBatch();
    requestAnimationFrame(() => this.loop());
  }
}
