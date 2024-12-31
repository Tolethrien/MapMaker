import Aurora from "./core/aurora/auroraCore";
import Batcher from "./core/aurora/urp/batcher";
import InputManager from "./core/modules/inputManager/inputManager";
import GlobalStore from "./core/modules/globalStore/globalStore";
import EventBus from "./core/modules/eventBus/eventBus";
import EngineDebugger from "./core/modules/debugger/debugger";
import EntityManager, { ProjectConfig } from "./core/entitySys/entityManager";

export default class Engine {
  private static isInit = false;
  private static loopID: number = 0;
  public static async initialize(
    canvas: HTMLCanvasElement,
    config: ProjectConfig
  ) {
    if (this.isInit) {
      EngineDebugger.showInfo(
        "Engine already initialize, closing current instance...",
        "Engine"
      );
      this.closeEngine();
    }
    GlobalStore.add("projectConfig", config);
    GlobalStore.add(
      "currentProjectPath",
      `${config.projectPath}\\${config.name}`
    );
    await Aurora.initialize(canvas); // needs to be before preload
    await Batcher.createBatcher({
      backgroundColor: [0, 0, 0, 255],
      bloom: { active: false, str: 0 },
      customCamera: false,
      lighting: false,
    });
    EventBus.emit("engineInit", true);
    InputManager.init(canvas);
    this.isInit = true;
    this.loop();
  }
  public static closeEngine() {
    if (!this.isInit) return;
    EngineDebugger.showInfo(
      "Engine already initialize, closing current instance...",
      "Engine"
    );
    cancelAnimationFrame(this.loopID);
    Batcher.closeBatcher();
    EntityManager.clearAllManagerData();
    GlobalStore.remove("currentProjectPath");
    GlobalStore.remove("projectConfig");
    EventBus.emit("engineInit", false);
    Aurora.setFirstAuroraFrame();
    this.isInit = false;
  }

  private static loop() {
    Batcher.startBatch();
    EntityManager.updateAll();
    EntityManager.renderAll();
    Batcher.endBatch();
    this.loopID = requestAnimationFrame(() => this.loop());
  }
}
