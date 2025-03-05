import { getAPI } from "@/preload/getAPI";
import Link from "./link";
import EventBus from "./eventBus";
import { Tile } from "@/editor/view/rightBar/modules/textureView/add/tileCanvas";
import { Structure } from "@/editor/view/rightBar/modules/textureView/add/objectStructure";

export interface TextureMeta {
  id: string;
  absolutePath: string;
  path: string;
  tileSize: Size2D;
  name: string;
}
type TileItem = {
  id: string;
  crop: Position2D;
  textureID: string;
  collider: boolean;
};
type StructureItem = {
  id: string;
  cropVec: { x: number; y: number; w: number; h: number };
  colliderVec: { x: number; y: number; w: number; h: number };
  anchorVec: Position2D;
  textureID: string;
  collider: boolean;
};
const ob1: TextureMeta = {
  id: "dc044dee-c48c-4d79-bcee-1241df4790fd",
  absolutePath: "C:\\Users\\Tolet\\Desktop\\32523523\\textures\\world.png",
  name: "world.png",
  path: "media:C:\\Users\\Tolet\\Desktop\\32523523\\textures\\world.png",
  tileSize: { h: 16, w: 16 },
};
const ob2: TextureMeta = {
  id: "2334a840-d610-459e-8716-956a5811e0b2",
  absolutePath: "C:\\Users\\Tolet\\Desktop\\32523523\\textures\\postapo.png",
  name: "postapo.png",
  path: "media:C:\\Users\\Tolet\\Desktop\\32523523\\textures\\postapo.png",
  tileSize: { h: 16, w: 16 },
};
//TODO: nie czyszcza sie objectset ani tileSet podczas zamykania komponentu
const { addTextureFile, deleteTextureFile } = getAPI("project");
export default class AssetsManager {
  private static textures: Map<string, TextureMeta> = new Map([
    // [ob1.id, ob1],
    // [ob2.id, ob2],
  ]);
  //TODO: remove this after aurora rework
  private static textureIndexes: Map<string, number> = new Map([
    ["dummy", 0],
    ["grid", 1],
  ]);
  private static tileLUT: Map<string, TileItem> = new Map();
  private static objectLUT: Map<string, StructureItem> = new Map();

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
  // public static verifyPresentByPath(path: string) {
  //   const textures = Array.from(this.textures.values());
  //   const found = textures.find((texture) => texture.path === path);
  //   return found === undefined ? false : true;
  // }
  public static addToTileLUT(LUT: Map<number, Tile>, textureID: string) {
    LUT.forEach((tile) => {
      if (!tile.included) return;
      const id = crypto.randomUUID();
      this.tileLUT.set(id, {
        collider: tile.collider,
        crop: tile.position,
        id: id,
        textureID: textureID,
      });
    });
    console.log(this.tileLUT);
  }

  public static addToObjectLUT(LUT: Structure[], textureID: string) {
    LUT.forEach((struct) => {
      const id = crypto.randomUUID();
      const crop = struct.pointsPath;
      const col = struct.pointsCollider;
      this.objectLUT.set(id, {
        collider: struct.colliderTiles.size > 0,
        cropVec: { x: crop.A.x, y: crop.A.y, w: crop.B.x, h: crop.B.y },
        anchorVec: { x: struct.pointsAnchor.x, y: struct.pointsAnchor.y },
        colliderVec: {
          x: col.A.x,
          y: col.A.y,
          w: col.B.x,
          h: col.B.y,
        },
        id: id,
        textureID: textureID,
      });
    });
    console.log(this.objectLUT);
    console.log(this.textures);
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
    if (!success)
      return { error: `error to: ${error}`, success, textureID: "" };
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
    EventBus.emit("reTexture");
    return { error: "", success: true, textureID: id };
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
    EventBus.emit("reTexture");

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
      if (config.textureUsed.length !== 0) EventBus.emit("reTexture");
    });
  }
}
