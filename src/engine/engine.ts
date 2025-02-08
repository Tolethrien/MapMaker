import Aurora from "./core/aurora/auroraCore";
import Batcher from "./core/aurora/urp/batcher";
import InputManager from "./core/modules/inputManager";
import EngineDebugger from "./core/modules/debugger";
import EntityManager from "./core/entitySystem/core/entityManager";
import Camera from "./core/entitySystem/entities/camera";
import RenderStatsConnector from "@/editor/view/rightBar/modules/renderStats/connector";
import GlobalStore from "./core/modules/globalStore";
import Link from "@/utils/link";

import { convertTextures, sendNotification } from "@/utils/utils";
//TODO: masz 3 load texture a mozesz wczytywac raz
export default class Engine {
  private static isInit = false;
  private static loopID: number = 0;
  public static TexturesIDs: Map<string, number> = new Map();
  public static async initialize(config: ProjectConfig) {
    if (this.isInit) {
      EngineDebugger.showInfo(
        "Engine already initialize, closing current instance...",
        "Engine"
      );
      this.closeEngine();
    }
    //TODO: jeden centralny punkt canvasu
    //TODO: te wszystkie inity zrobic w eventBusie
    const canvas = document.getElementById("editorCanvas") as HTMLCanvasElement;
    // GlobalStore.add("projectConfig", config);
    Link.set<ProjectConfig>("projectConfig")(config);

    await Aurora.initialize(canvas); // needs to be before preload
    Camera.initialize(config.chunkSizeInPixels.h, config.chunkSizeInPixels.w);

    const textures = await convertTextures(config.textureUsed);
    Engine.TexturesIDs.set("dummy", 0);
    Engine.TexturesIDs.set("grid", 1);

    textures.forEach((texture, index) =>
      Engine.TexturesIDs.set(texture.id, index + 2)
    );
    await Batcher.createBatcher({
      backgroundColor: [0, 0, 0, 255],
      bloom: { active: false, str: 0 },
      customCamera: true,
      loadTextures: textures.length > 0 ? textures : undefined,
      lighting: false,
      maxQuadPerSceen: 100000,
    });
    config.layersVisibility.forEach((layer) =>
      EntityManager.updateLayerVis(layer[0], layer[1])
    );
    Link.set("engineInit")(true);
    sendNotification({
      type: "info",
      value: `Engine Initialize with project: ${config.name}`,
    });
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
    GlobalStore.remove("projectConfig");
    Link.set("engineInit")(false);
    Aurora.setFirstAuroraFrame();
    this.isInit = false;
  }
  public static async reTexture() {
    await Batcher.reTextureBatcher();
  }
  private static loop() {
    RenderStatsConnector.start();
    Batcher.startBatch();
    EntityManager.frameCleanUp();
    InputManager.update();
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
