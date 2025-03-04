import Vec2D from "@/math/vec2D";
import { Lookups } from "./parserTypes";
interface FontMeta {
  LUT: Lookups;
  textureIndex: number;
  atlasSize: Vec2D;
}
export default class Fonter {
  private static loadedFonts = new Map<string, FontMeta>();

  public static addFont({
    fontName,
    LUT,
    textureIndex,
    atlasSize,
  }: FontMeta & { fontName: string }) {
    this.loadedFonts.set(fontName, { LUT, textureIndex, atlasSize });
  }
  public static getFontMeta(fontName: string) {
    const data = this.loadedFonts.get(fontName);
    if (!data) throw new Error(`no meta data of font: ${fontName}`);
    return data;
  }
  public static get getAllFontsMeta() {
    return this.loadedFonts;
  }
}
