import Aurora from "./core/aurora/auroraCore";
import Batcher from "./core/aurora/urp/batcher";
import Entity from "./core/entitySys/entity";
import InputManager from "./core/modules/inputManager/inputManager";
import GlobalStore from "./core/modules/globalStore/globalStore";
import EventBus from "./core/modules/eventBus/eventBus";
import EngineDebugger from "./core/modules/debugger/debugger";

export default class Engine {
  private static canvas: HTMLCanvasElement;
  private static entities: Map<string, Entity> = new Map();
  private static isInit = false;
  private static loopID: number = 0;
  public static async initialize(canvas: HTMLCanvasElement) {
    if (this.isInit) {
      EngineDebugger.showInfo("Engine already initialize, closing...");
      this.closeEngine();
    }
    this.canvas = canvas;
    await Aurora.initialize(canvas); // needs to be before preload
    await Batcher.createBatcher({
      backgroundColor: [0, 255, 0, 255],
      bloom: { active: false, str: 0 },
      customCamera: false,
      lighting: false,
    });
    EventBus.emit("engineInit", true);
    InputManager.init(canvas);
    this.loop();
  }
  public static closeEngine() {
    cancelAnimationFrame(this.loopID);
    Batcher.closeBatcher();
    this.entities.clear();
    GlobalStore.remove("currentProjectPath");
    EventBus.emit("engineInit", false);
    Aurora.setFirstAuroraFrame();
    this.isInit = false;
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
    console.log("update");
    //TODO: domyslnie nie bedziesz potrzebowac 2 loopow, bo nie ma nic co moze zmienic pozycje innego tile'a
    this.entities.forEach((entity) => {
      entity.update();
    });
    this.entities.forEach((entity) => {
      entity.render();
    });
    Batcher.endBatch();
    this.loopID = requestAnimationFrame(() => this.loop());
  }
}
