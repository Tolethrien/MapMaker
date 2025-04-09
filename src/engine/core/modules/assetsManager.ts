import { getAPI } from "@/preload/getAPI";
import Link from "../../../utils/link";
import EventBus from "../../../utils/eventBus";
import { createCanvas2D, getConfig, loadImage } from "../../../utils/utils";

import EngineDebugger from "@/engine/core/modules/debugger";
import MathU from "@/math/math";
export type LutType = "tile" | "structure";
type GetItem<T extends LutType> = {
  item: T extends "structure" ? StructureLUTItem : TileLUTItem;
  view: View;
  textureIndex: number;
};
type UpdateLutTextureProps = {
  path: string;
  tileSize: Size2D;
};
export interface TileLUTItem {
  id: string;
  crop: Box2D;
  viewID: string;
  collider: boolean;
}
export interface StructureLUTItem {
  id: string;
  viewID: string;
  crop: Box2D;
  onCanvasPosition: Box2D;
  anchorTile: number;
  objectTileSize: Size2D;
  colliderTiles: number[];
  boxOffset: Box2D;
}
export interface View {
  tileSize: Size2D;
  textureUsed: string;
  id: string;
  type: LutType;
  name: string;
  img: HTMLImageElement | undefined;
}

export interface TextureMeta {
  id: string;
  absolutePath: string;
  path: string;
  name: string;
}
export type TileCanvasExport = {
  crop: Box2D;
  collider: boolean;
  included: boolean;
};
export type StructureCanvasExport = Omit<
  StructureLUTItem,
  "id" | "viewID" | "boxOffset"
>;
export type ReTextureEmitter = { reload: boolean };
const { getFileName } = getAPI("utils");
const { addTextureFile, deleteTextureFile, writeTextureLUT, readTextureLUT } =
  getAPI("project");

export default class AssetsManager {
  private static textures: Map<string, TextureMeta> = new Map();
  //TODO: remove this after aurora rework
  private static textureIndexes: Map<string, number> = new Map([
    ["dummy", 0],
    ["grid", 1],
  ]);
  private static views: Map<string, View> = new Map();
  private static tileLUT: Map<string, TileLUTItem> = new Map();
  private static objectLUT: Map<string, StructureLUTItem> = new Map();

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
  public static getTextureIndexFromLUT(type: LutType, id: string) {
    let item: StructureLUTItem | TileLUTItem | undefined;
    if (type === "structure") item = this.objectLUT.get(id);
    else item = this.tileLUT.get(id);
    if (!item) return;
    const view = this.views.get(item.viewID);
    if (!view) return;
    return this.textureIndexes.get(view.textureUsed);
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
  public static getTexturesArray() {
    return Array.from(this.textures.values());
  }
  public static getTexturesIndexesArray() {
    return Array.from(this.textureIndexes.values());
  }

  public static getTexture(id: string) {
    return this.textures.get(id);
  }

  public static getItem<T extends LutType>(
    viewType: T,
    itemID: string
  ): GetItem<T> | undefined {
    let item: StructureLUTItem | TileLUTItem | undefined = undefined;
    if (viewType === "structure") item = this.objectLUT.get(itemID);
    else if (viewType === "tile") item = this.tileLUT.get(itemID);
    if (!item) return;
    const view = this.views.get(item.viewID);
    if (!view) return;
    const textureIndex = this.textureIndexes.get(view.textureUsed);
    if (!textureIndex) return;
    return {
      item: item as GetItem<T>["item"],
      view,
      textureIndex,
    };
  }
  public static async deleteView(id: string) {
    //todo: zamien return na err
    const view = this.views.get(id);
    if (!view) return { error: "no view", success: false };
    //remove all LUT Items
    if (view.type === "tile") {
      this.tileLUT.forEach((tile) => {
        if (tile.viewID === view.id) this.tileLUT.delete(tile.id);
      });
    } else if (view.type === "structure") {
      this.objectLUT.forEach((struct) => {
        if (struct.viewID === view.id) this.tileLUT.delete(struct.id);
      });
    }
    //if any other view use texture don't delete it!
    let removeTexture = true;
    for (const availableView of this.views.values()) {
      if (availableView.id === view.id) continue;
      if (availableView.textureUsed === view.textureUsed) {
        removeTexture = false;
        break;
      }
    }
    if (removeTexture) {
      const { projectPath } = getConfig();
      const { error, success } = await deleteTextureFile({
        projectPath,
        fileID: view.textureUsed,
      });
      if (!success) return { error, success };
      this.textures.delete(view.textureUsed);
    }
    //remove view self, write new lut to file
    this.views.delete(view.id);
    const { error, success } = await this.uploadToTextureLUT();
    if (!success) return { error, success };
    EventBus.emit<ReTextureEmitter>("reTexture", { reload: removeTexture });
    return { error: "", success: true };
  }
  public static async updateStructLUT(
    LUT: StructureCanvasExport[],
    texture: UpdateLutTextureProps
  ) {
    const { textureID, uploaded } = await this.verifyAndUpload(texture.path);
    const viewID = this.createView(textureID, texture.tileSize, "structure");
    this.addStructsToLUT(LUT, viewID);
    await this.generateViewImage(viewID);
    const { error, success } = await this.uploadToTextureLUT();

    if (!success) return { error, success };
    EventBus.emit<ReTextureEmitter>("reTexture", {
      reload: uploaded,
    });

    return { error: "", success: true };
  }
  public static async updateTileLUT(
    LUT: TileCanvasExport[],
    texture: {
      path: string;
      tileSize: Size2D;
    }
  ) {
    const { textureID, uploaded } = await this.verifyAndUpload(texture.path);
    const viewID = this.createView(textureID, texture.tileSize, "tile");
    this.addTilesToLut(LUT, viewID);
    await this.generateViewImage(viewID);
    const { error, success } = await this.uploadToTextureLUT();
    if (!success) return { error, success };
    EventBus.emit<ReTextureEmitter>("reTexture", {
      reload: uploaded,
    });
    return { error: "", success: true };
  }
  public static async loadDataFromConfig() {
    const config = getConfig();
    const { data, error, success } = await readTextureLUT(config.projectPath);
    if (!data) return { error, success };

    data.textures.forEach((texture) => this.textures.set(texture.id, texture));
    data.views.forEach((view) =>
      this.views.set(view.id, { ...view, img: undefined })
    );
    data.tiles.forEach((tile) => this.tileLUT.set(tile.id, tile));
    data.objects.forEach((struct) => this.objectLUT.set(struct.id, struct));
    for (const view of this.views.values()) {
      await this.generateViewImage(view.id);
    }

    if (data.textures.length !== 0) {
      EventBus.emit<ReTextureEmitter>("reTexture", { reload: true });
    }
  }
  public static getLUTFromView(type: LutType, viewID: string) {
    if (type === "structure")
      return Array.from(this.objectLUT.values()).filter(
        (struct) => struct.viewID === viewID
      );
    else
      return Array.from(this.tileLUT.values()).filter(
        (tile) => tile.viewID === viewID
      );
  }

  public static async uploadTexture(path: string) {
    const config = getConfig();
    const id = crypto.randomUUID();
    const { data, error, success } = await addTextureFile({
      filePath: path,
      projectPath: config.projectPath,
      id,
    });
    if (!success) return { error: `error: ${error}`, success, textureID: "" };
    const texture = data?.textures.at(-1)!;
    this.textures.set(id, texture);
    return { error: "", success: true, textureID: id };
  }

  private static async uploadToTextureLUT() {
    const config = getConfig();
    const views = Array.from(this.views.values()).map(
      ({ img, ...rest }) => rest
    );
    const { error, success } = await writeTextureLUT({
      config: {
        views: views,
        textures: Array.from(this.textures.values()),
        objects: Array.from(this.objectLUT.values()),
        tiles: Array.from(this.tileLUT.values()),
      },
      projectPath: config.projectPath,
      allowOverride: true,
    });
    return { error, success };
  }

  private static async generateViewImage(viewID: string) {
    const view = this.getView(viewID);
    if (!view) return;
    if (view.type === "structure") {
      //TODO: tutaj nie ustawiac tak z dupy rozmiaru
      const { canvas, ctx } = createCanvas2D(1300, 700);
      ctx.fillStyle = "white";
      await this.structImageFromLUT(view, ctx);
      const blob = await new Promise<Blob | null>((res, rej) => {
        canvas.toBlob((blob) => {
          if (!blob) rej("no blob");
          res(blob);
        });
      });
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const img = await loadImage(url);
      view.img = img;
    } else {
      const texture = this.getTexture(view.textureUsed);
      if (!texture) return;
      const img = await loadImage(texture.path);
      view.img = img;
    }
  }

  private static async structImageFromLUT(
    view: View,
    ctx: CanvasRenderingContext2D
  ) {
    const texture = this.textures.get(view.textureUsed);
    if (!texture) return;
    const img = await loadImage(texture.path);
    const structs = Array.from(this.objectLUT.values()).filter(
      (struct) => struct.viewID === view.id
    );
    structs.forEach((struct) => {
      ctx.drawImage(
        img,
        struct.crop.x,
        struct.crop.y,
        struct.crop.w - struct.crop.x,
        struct.crop.h - struct.crop.y,
        struct.onCanvasPosition.x,
        struct.onCanvasPosition.y,
        struct.onCanvasPosition.w,
        struct.onCanvasPosition.h
      );
    });
  }
  private static async verifyAndUpload(path: string) {
    const loadedTexture = await this.verifyPresent(path);
    if (loadedTexture) return { textureID: loadedTexture.id, uploaded: false };
    const { error, success, textureID } = await this.uploadTexture(path);
    if (!success) EngineDebugger.showError(error);
    return { textureID: textureID, uploaded: true };
  }
  private static async verifyPresent(path: string) {
    const fileName = await getFileName(path);
    EngineDebugger.assertValue(fileName, {
      msg: "Trying to verify texture file, but got no file name",
      varName: "fileName",
    });
    for (const texture of this.textures.values()) {
      const textName = await getFileName(texture.path);
      if (fileName === textName) return texture;
    }
    return undefined;
  }
  private static getStructureOffset(item: StructureCanvasExport) {
    const { tileSize } = getConfig();
    const { tileCol, tileRow } = MathU.getTilePosInGrid(
      item.anchorTile,
      item.objectTileSize.w
    );
    return {
      x: -tileCol * tileSize.w,
      y: -tileRow * tileSize.h,
      w: item.objectTileSize.w * tileSize.w,
      h: item.objectTileSize.h * tileSize.h,
    };
  }
  private static addTilesToLut(LUT: TileCanvasExport[], viewID: string) {
    LUT.forEach((tile) => {
      if (!tile.included) return;
      const id = crypto.randomUUID();
      this.tileLUT.set(id, {
        collider: tile.collider,
        crop: tile.crop,
        id: id,
        viewID,
      });
    });
  }
  private static addStructsToLUT(LUT: StructureCanvasExport[], viewID: string) {
    LUT.forEach((struct) => {
      const id = crypto.randomUUID();
      const offset = this.getStructureOffset(struct);
      this.objectLUT.set(id, {
        ...struct,
        id,
        viewID,
        boxOffset: offset,
      });
    });
  }
  private static createView(
    textureID: string,
    tileSize: Size2D,
    type: LutType
  ) {
    const id = crypto.randomUUID();
    this.views.set(id, {
      id: id,
      name: id,
      textureUsed: textureID,
      tileSize: { w: tileSize.w, h: tileSize.h },
      type,
      img: undefined,
    });
    return id;
  }
  public static DEBUG() {
    console.log("textures", this.textures);
    console.log("views", this.views);
    console.log("tileLUT", this.tileLUT);
    console.log("objLUT", this.objectLUT);
  }
}
