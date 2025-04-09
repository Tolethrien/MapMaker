import Aurora from "./core/aurora/auroraCore";
import Batcher from "./core/aurora/urp/batcher";
import InputManager from "./core/modules/inputManager";
import EngineDebugger from "./core/modules/debugger";
import EntityManager from "./core/entitySystem/core/entityManager";
import Camera from "./core/entitySystem/entities/camera";
import RenderStatsConnector from "@/editor/view/rightBar/modules/renderStats/connector";
import Link from "@/utils/link";

import { sendNotification } from "@/utils/utils";
import AssetsManager from "@/engine/core/modules/assetsManager";
import GlobalStore from "./core/modules/globalStore";
import EventManager from "./core/modules/eventManager";
export default class Engine {
  private static isInit = false;
  private static loopID: number = 0;
  public static async initialize(config: ProjectConfig) {
    if (this.isInit) this.closeEngine();

    const canvas = document.getElementById("editorCanvas") as HTMLCanvasElement;
    Link.set<ProjectConfig>("projectConfig")(config);
    GlobalStore.add("globalCanvas", canvas);

    await Aurora.initialize(); // needs to be before preload
    await Batcher.createBatcher({
      backgroundColor: [0, 0, 0, 255],
      bloom: { active: false, str: 0 },
      customCamera: true,
      loadTextures: [],
      lighting: true,
      maxQuadPerSceen: 10000,
    });

    await AssetsManager.loadDataFromConfig();
    Camera.initialize(canvas.width, canvas.height);
    InputManager.init();
    Link.set("engineInit")(true);

    sendNotification({
      type: "info",
      value: `Engine Initialize with project: ${config.name}`,
    });
    this.isInit = true;
    this.loop();
  }
  public static closeEngine() {
    EngineDebugger.showInfo(
      "Engine already initialize, closing current instance...",
      "Engine"
    );
    cancelAnimationFrame(this.loopID);
    Batcher.closeBatcher();
    AssetsManager.clearAssets();
    EntityManager.clearAll();
    Link.set("engineInit")(false);
    Aurora.setFirstAuroraFrame();
    this.isInit = false;
  }

  private static loop() {
    RenderStatsConnector.start();
    // Batcher.setScreenShader("noice", 0.6);
    InputManager.update();
    Camera.update();
    Batcher.setCameraBuffer(Camera.getProjectionViewMatrix.getMatrix);
    // EntityManager.onEvent();
    EventManager.update();
    EntityManager.onUpdate();
    Batcher.startBatch();
    EntityManager.onRender();
    RenderStatsConnector.swapToGPU();
    Batcher.endBatch();
    RenderStatsConnector.stop();
    this.loopID = requestAnimationFrame(() => this.loop());
  }
}
