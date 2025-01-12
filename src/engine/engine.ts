import Aurora from "./core/aurora/auroraCore";
import Batcher from "./core/aurora/urp/batcher";
import InputManager from "./core/modules/inputManager";
import EngineDebugger from "./core/modules/debugger";
import EntityManager from "./core/entitySystem/core/entityManager";
import Camera from "./core/entitySystem/entities/camera";
import RenderStatsConnector from "@/editor/components/modules/renderStats/connector";
import GlobalStore from "./core/modules/globalStore";
import Link from "@/vault/link";
import world from "@/assets/world.png";
import flora from "@/assets/flora.png";
import { getAPI } from "@/preload/getAPI";
const { loadTexture } = getAPI("API_FILE_SYSTEM");
//TODO: przerob by w config projectPath mial tez nazwe folderu a nie prowadzil do rodzica
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

    const textures = await this.convertTextures(config.textureUsed);

    await Batcher.createBatcher({
      backgroundColor: [0, 0, 0, 255],
      bloom: { active: false, str: 0 },
      customCamera: true,
      loadTextures: textures.length > 1 ? textures : undefined,
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
  public static async reTexture() {
    console.log("retexturing");
    await Batcher.reTextureBatcher();
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
  private static async convertTextures(textures: ProjectConfig["textureUsed"]) {
    const promises = textures.map(async (texture) => {
      const textureStatus = await loadTexture(texture.path);
      if (!textureStatus.success) {
        throw new Error(`error loading texture ${texture.path}`);
      }
      return textureStatus.src;
    });
    const results = await Promise.all(promises);
    return results.map((texture, index) => {
      return { name: textures[index].name, url: texture };
    });
  }
}
