import { getAPI } from "@/preload/getAPI";
import Link from "./link";

export interface TextureMeta {
  id: string;
  absolutePath: string;
  path: string;
  tileSize: Size2D;
  name: string;
}
const { addTextureFile, deleteTextureFile } = getAPI("project");
export default class AssetsManager {
  private static textures: Map<string, TextureMeta> = new Map([]);
  //TODO: remove this after aurora rework
  private static textureIndexes: Map<string, number> = new Map([
    ["dummy", 0],
    ["grid", 1],
  ]);
  private static texturesLUT = {};

  public static reindexTextures() {
    this.textureIndexes.clear();
    this.textureIndexes.set("dummy", 0);
    this.textureIndexes.set("grid", 1);
    this.textures
      .values()
      .forEach((texture, index) =>
        this.textureIndexes.set(texture.id, index + 2)
      );
  }
  public static getTextureIndexFromID(id: string) {
    return this.textureIndexes.get(id);
  }
  public static clearAssets() {
    this.textures.clear();
    this.textureIndexes.clear();
    this.textureIndexes.set("dummy", 0);
    this.textureIndexes.set("grid", 1);
  }
  public static async uploadTexture(path: string, tileSize: Size2D) {
    const [getConfig, setConfig] = Link.getLink<ProjectConfig>("projectConfig");
    const config = getConfig();
    //TODO: zabloowac mozliwosc dodawania 2 tych samych zdjec, bo i po co?
    const id = crypto.randomUUID();
    const { data, error, success } = await addTextureFile({
      filePath: path,
      projectPath: config.projectPath,
      tileSize: { w: tileSize.w, h: tileSize.h },
      id: id,
    });
    if (!success) return { error: `error to: ${error}`, success };
    const texture = data?.textureUsed.at(-1)!;
    const name = texture.path.split("\\").at(-1)!;
    this.textures.set(id, {
      id,
      absolutePath: texture.path,
      path: `media:${texture.path}`,
      tileSize: { h: tileSize.h, w: tileSize.w },
      name: name,
    });
    setConfig(data!);

    return { error: "", success: true };
  }
  public static async removeTexture(id: string) {
    const [getConfig, setConfig] = Link.getLink<ProjectConfig>("projectConfig");
    const config = getConfig();
    const { error, success, data } = await deleteTextureFile({
      fileID: id,
      projectPath: config.projectPath,
    });
    if (!success) return { error, success };
    this.textures.delete(id);
    setConfig(data!);

    return { error: "", success: true };
  }
  public static getTexturesArray() {
    return Array.from(this.textures.values());
  }

  public static getTexture(id: string) {
    return this.textures.get(id);
  }
  public static loadTexturesFromConfig() {
    const config = Link.get<ProjectConfig>("projectConfig")();
    config.textureUsed.forEach((texture) => {
      const name = texture.path.split("\\").at(-1)!;
      this.textures.set(texture.id, {
        absolutePath: texture.path,
        path: `media:${texture.path}`,
        tileSize: { h: texture.tileSize.h, w: texture.tileSize.w },
        name: name,
        id: texture.id,
      });
    });
  }
}
