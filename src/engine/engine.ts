import Aurora from "./core/aurora/auroraCore";
import Batcher from "./core/aurora/urp/batcher";
import Entity from "./core/entitySys/entity";
import EventManager from "./core/modules/eventManager/eventManager";
import GlobalStore from "./core/modules/globalStore/globalStore";

export default class Engine {
  private static canvas: HTMLCanvasElement;
  private static entities: Map<string, Entity> = new Map();
  public static async initialize(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.entities.clear();
    GlobalStore.clearStore();
    //TODO: prawdopodobnie przy reinicjalizacji dodajesz na nowo pipeline itp do juz istniejacych bo to nigdy nie jest czyszczone
    // bo aurora nie była projektowana z myślą o mozliwosci jej odpalania.
    //TODO: w ogole zrob lepsza reinicjalizacje!
    await Aurora.initialize(canvas); // needs to be before preload
    await Batcher.createBatcher({
      backgroundColor: [0, 255, 0, 255],
      bloom: { active: false, str: 0 },
      customCamera: false,
      lighting: false,
    });
    EventManager.init(canvas);
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
    //TODO: domyslnie nie bedziesz potrzebowac 2 loopow, bo nie ma nic co moze zmienic pozycje innego tile'a
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
