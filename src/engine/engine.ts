import Aurora from "./core/aurora/auroraCore";
import Batcher from "./core/aurora/urp/batcher";
import InputManager from "./core/modules/inputManager";
import EngineDebugger from "./core/modules/debugger";
import EntityManager, {
  ProjectConfig,
} from "./core/entitySystem/core/entityManager";
import Camera from "./core/entitySystem/entities/camera";
import RenderStatsConnector from "@/editor/components/modules/renderStats/connector";
import GlobalStore from "./core/modules/globalStore";
import Link from "@/vault/link";
import world from "@/assets/world.png";
import flora from "@/assets/flora.png";
export default class Engine {
  private static isInit = false;
  private static loopID: number = 0;
  public static async initialize(config: ProjectConfig) {
    if (this.isInit) {
      EngineDebugger.showInfo(
        "Engine already initialize, closing current instance...",
        "Engine"
      );
      this.closeEngine();
    }
    //TODO: jeden centralny punkt canvasu
    const canvas = document.getElementById("editorCanvas") as HTMLCanvasElement;
    // GlobalStore.add("projectConfig", config);
    Link.set<ProjectConfig>("projectConfig")(config);

    GlobalStore.add(
      "currentProjectPath",
      `${config.projectPath}\\${config.name}`
    );

    await Aurora.initialize(canvas); // needs to be before preload
    Camera.initialize();
    await Batcher.createBatcher({
      backgroundColor: [0, 0, 0, 255],
      bloom: { active: false, str: 0 },
      customCamera: true,
      loadTextures: [{ name: "world", url: world }],
      lighting: false,
      maxQuadPerSceen: 100000,
    });
    //TODO: te wszystkie inity zrobic w eventBusie
    Link.set("engineInit")(true);
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
    EntityManager.clearAll();
    GlobalStore.remove("currentProjectPath");
    GlobalStore.remove("projectConfig");
    Link.set("engineInit")(false);

    Aurora.setFirstAuroraFrame();
    this.isInit = false;
  }

  private static loop() {
    RenderStatsConnector.start();
    Batcher.startBatch();
    EntityManager.frameCleanUp();
    Camera.update();

    Batcher.setCameraBuffer(Camera.getProjectionViewMatrix.getMatrix);
    EntityManager.updateAll();
    EntityManager.renderAll();
    RenderStatsConnector.swapToGPU();
    Batcher.endBatch();
    RenderStatsConnector.stop();
    this.loopID = requestAnimationFrame(() => this.loop());
  }
}
