import { getAPI } from "@/preload/getAPI";
import Link from "./link";
import EventBus from "./eventBus";
import { Tile } from "@/editor/view/rightBar/modules/textureView/add/tileCanvas";
import { Structure } from "@/editor/view/rightBar/modules/textureView/add/objectStructure";
import { createCanvas2D, loadImage } from "./utils";

export interface TextureMeta {
  id: string;
  absolutePath: string;
  path: string;
  name: string;
}
export interface TileItem {
  id: string;
  crop: Position2D;
  viewID: string;
  collider: boolean;
}
type ViewType = "tile" | "object";
//TODO: remember to remove textures from projectCnfi EVERYWHERE!
export interface StructureItem {
  id: string;
  cropVec: { x: number; y: number; w: number; h: number };
  colliderVec: { x: number; y: number; w: number; h: number };
  anchorVec: Position2D;
  viewID: string;
  collider: boolean;
}
export interface View {
  tileSize: Size2D;
  textureUsed: string;
  id: string;
  type: ViewType;
  name: string;
  img: HTMLImageElement | undefined;
}
const ob1: TextureMeta = {
  id: "dc044dee-c48c-4d79-bcee-1241df4790fd",
  absolutePath: "C:\\Users\\Tolet\\Desktop\\32523523\\textures\\world.png",
  name: "world.png",
  path: "media:C:\\Users\\Tolet\\Desktop\\32523523\\textures\\world.png",
};
const ob2: TextureMeta = {
  id: "2334a840-d610-459e-8716-956a5811e0b2",
  absolutePath: "C:\\Users\\Tolet\\Desktop\\32523523\\textures\\postapo.png",
  name: "postapo.png",
  path: "media:C:\\Users\\Tolet\\Desktop\\32523523\\textures\\postapo.png",
};

const { addTextureFile, deleteTextureFile, writeTextureLUT, readTextureLUT } =
  getAPI("project");
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
  private static views: Map<string, View> = new Map();
  private static tileLUT: Map<string, TileItem> = new Map();
  private static objectLUT: Map<string, StructureItem> = new Map();

  public static getViews() {
    return Array.from(this.views.values());
  }
  public static getView(id: string) {
    return this.views.get(id);
  }
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
    this.objectLUT.clear();
    this.tileLUT.clear();
    this.views.clear();
    this.textureIndexes.set("dummy", 0);
    this.textureIndexes.set("grid", 1);
  }

  public static verifyPresentByPath(path: string) {
    const textures = Array.from(this.textures.values());
    return textures.find((texture) => texture.path === path);
  }

  public static getTexturesArray() {
    return Array.from(this.textures.values());
  }

  public static getTexture(id: string) {
    return this.textures.get(id);
  }
  //THIIIIIIS
  public static addToObjectLUT(LUT: Structure[], viewID: string) {
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
        viewID,
      });
    });
  }
  //THIS
  public static async updateObjectLUT(
    LUT: Structure[],
    texture: {
      path: string;
      tileSize: Size2D;
    }
  ) {
    let textureID: string;
    const loadedTexture = this.verifyPresentByPath(texture.path);
    if (loadedTexture) textureID = loadedTexture.id;
    else {
      const {
        error,
        success,
        textureID: loadedID,
      } = await this.uploadTexture(texture.path);
      if (!success) return { error, success };
      textureID = loadedID;
    }
    const viewID = this.createView(textureID, texture.tileSize, "object");
    this.addToObjectLUT(LUT, viewID);
    this.generateObjectImage(viewID);
    const { error, success } = await this.uploadToTextureLUT();

    if (!success) return { error, success };

    return { error: "", success: true };
  }
  public static async updateTileLUT(
    LUT: Tile[],
    texture: {
      path: string;
      tileSize: Size2D;
    }
  ) {
    let textureID: string;
    const loadedTexture = this.verifyPresentByPath(texture.path);
    if (loadedTexture) textureID = loadedTexture.id;
    else {
      const {
        error,
        success,
        textureID: loadedID,
      } = await this.uploadTexture(texture.path);
      if (!success) return { error, success };
      textureID = loadedID;
    }
    const viewID = this.createView(textureID, texture.tileSize, "tile");
    this.addToTileLUT(LUT, viewID);
    const { error, success } = await this.uploadToTextureLUT();
    if (!success) return { error, success };

    return { error: "", success: true };
  }
  private static addToTileLUT(LUT: Tile[], viewID: string) {
    LUT.forEach((tile) => {
      if (!tile.included) return;
      const id = crypto.randomUUID();
      this.tileLUT.set(id, {
        collider: tile.collider,
        crop: tile.position,
        id: id,
        viewID,
      });
    });
  }
  private static async uploadToTextureLUT() {
    const config = Link.get<ProjectConfig>("projectConfig")();
    const views = Array.from(this.views.values()).map(
      ({ img, ...rest }) => rest
    );
    const { error, success } = await writeTextureLUT({
      config: {
        objects: Array.from(this.objectLUT.values()),
        textures: Array.from(this.textures.values()),
        tiles: Array.from(this.tileLUT.values()),
        views: views,
      },
      projectPath: config.projectPath,
      allowOverride: true,
    });
    return { error, success };
  }
  public static createView(
    textureID: string,
    tileSize: Size2D,
    type: ViewType
  ) {
    const id = crypto.randomUUID();

    const view: View = {
      id: id,
      name: id,
      textureUsed: textureID,
      tileSize: { w: tileSize.w, h: tileSize.h },
      type,
      img: undefined,
    };
    this.views.set(id, view);
    return id;
  }
  private static async generateObjectImage(viewID: string) {
    const view = this.getView(viewID);
    if (!view) return;
    const { canvas, ctx } = createCanvas2D(500, 500);
    ctx.fillStyle = "white";
    ctx.fillRect(40, 40, 10, 10);
    await this.imageFromLUT(view, ctx);
    canvas.toBlob(async (blob) => {
      const url = URL.createObjectURL(blob!);
      const img = await loadImage(url);
      view.img = img;
    });
  }
  private static async imageFromLUT(view: View, ctx: CanvasRenderingContext2D) {
    const texture = this.textures.get(view.textureUsed);
    if (!texture) return;
    const img = await loadImage(texture.path);
    this.objectLUT.forEach((struct) => {
      if (view.id !== struct.viewID) return;
      ctx.drawImage(
        img,
        struct.cropVec.x,
        struct.cropVec.y,
        struct.cropVec.w,
        struct.cropVec.h,
        struct.cropVec.x,
        struct.cropVec.y,
        struct.cropVec.w,
        struct.cropVec.h
      );
      console.log("rusyje");
    });
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
  public static async uploadTexture(path: string) {
    const [getConfig, setConfig] = Link.getLink<ProjectConfig>("projectConfig");
    const config = getConfig();
    const id = crypto.randomUUID();
    const { data, error, success } = await addTextureFile({
      filePath: path,
      projectPath: config.projectPath,
      id,
    });
    if (!success)
      return { error: `error to: ${error}`, success, textureID: "" };
    const texture = data?.textures.at(-1)!;
    this.textures.set(id, texture);
    EventBus.emit("reTexture");
    return { error: "", success: true, textureID: id };
  }

  public static async loadDataFromConfig() {
    //ZMIEN TO POTEM
    const config = Link.get<ProjectConfig>("projectConfig")();
    const { data, error, success } = await readTextureLUT(
      "C:\\Users\\Tolet\\Desktop\\456"
    );
    if (!data) return { error, success };

    data.textures.forEach((texture) => this.textures.set(texture.id, texture));
    data.views.forEach((view) =>
      this.views.set(view.id, { ...view, img: undefined })
    );
    data.tiles.forEach((tile) => this.tileLUT.set(tile.id, tile));
    data.objects.forEach((struct) => this.objectLUT.set(struct.id, struct));

    if (data.textures.length !== 0) {
      EventBus.emit("reTexture");
      this.reindexTextures();
    }
    this.views.forEach(
      (view) => view.type === "object" && this.generateObjectImage(view.id)
    );
  }
  public static DEBUG() {
    console.log("textures", this.textures);
    console.log("views", this.views);
    console.log("tileLUT", this.tileLUT);
    console.log("objLUT", this.objectLUT);
  }
}
