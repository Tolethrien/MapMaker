import GlobalStore from "@/engine/core/modules/globalStore";
import { PassManifold } from "@/preload/globalLinks";
import AssetsManager, {
  StructureLUTItem,
  TileLUTItem,
  View,
} from "@/engine/core/modules/assetsManager";
import MathU from "@/math/math";

export default class CanvasController {
  private static canvas: HTMLCanvasElement;
  private static ctx: CanvasRenderingContext2D;
  private static view: View | undefined;
  private static LUTData: StructureLUTItem[] | TileLUTItem[];

  private static baseWidth = 0;
  private static baseHeight = 0;
  private static scaleFactor = 1;

  public static Init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.canvas.addEventListener("click", (e) => this.mouseEvents(e));
  }

  public static getViewID() {
    return this.view?.id ?? undefined;
  }

  public static setView(view: View) {
    this.view = view;
    if (!view.img) return;
    this.baseWidth = view.img.width;
    this.baseHeight = view.img.height;
    //to zachowuje scalar
    // this.canvas.width = this.baseWidth * this.scaleFactor;
    // this.canvas.height = this.baseHeight * this.scaleFactor;
    //to resetuje na zmianie view
    this.canvas.width = view.img.width;
    this.canvas.height = view.img.height;
    this.scaleFactor = 1;
    this.LUTData = AssetsManager.getLUTFromView(view.type, view.id);
    this.drawBackground();
  }

  private static drawBackground() {
    if (!this.view || !this.view.img) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(
      this.view.img,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
  }

  private static drawSelected(box: Box2D) {
    if (!this.view || !this.view.img) return;
    this.ctx.strokeStyle = "rgba(0,255,0,1)";
    this.ctx.strokeRect(
      box.x * this.scaleFactor,
      box.y * this.scaleFactor,
      box.w * this.scaleFactor,
      box.h * this.scaleFactor
    );
  }

  public static scale(way: "up" | "down") {
    const factor = way === "up" ? 1.1 : 0.9;
    this.scaleFactor *= factor;
    this.canvas.width = this.baseWidth * this.scaleFactor;
    this.canvas.height = this.baseHeight * this.scaleFactor;
    this.drawBackground();
  }

  private static mouseEvents(event: MouseEvent) {
    const adjustedX = event.offsetX / this.scaleFactor;
    const adjustedY = event.offsetY / this.scaleFactor;
    const mousePos = { x: adjustedX, y: adjustedY };

    let found: StructureLUTItem | TileLUTItem | undefined = undefined;

    if (this.view?.type === "structure") {
      for (const struct of this.LUTData as StructureLUTItem[]) {
        if (MathU.pointCollide(mousePos, struct.onCanvasPosition)) {
          found = struct;
          break;
        }
      }
    } else {
      for (const tile of this.LUTData as TileLUTItem[]) {
        if (
          MathU.pointCollide(mousePos, {
            x: tile.crop.x,
            y: tile.crop.y,
            w: this.view!.tileSize.w,
            h: this.view!.tileSize.h,
          })
        ) {
          found = tile;
          break;
        }
      }
    }
    this.drawBackground();
    if (found) {
      console.log(found);
      const [_, setter] = GlobalStore.get<PassManifold>("passManifold");
      this.drawSelected(
        "onCanvasPosition" in found
          ? found.onCanvasPosition
          : {
              x: found.crop.x,
              y: found.crop.y,
              w: this.view!.tileSize.w,
              h: this.view!.tileSize.h,
            }
      );
      setter({ LutID: found.id, type: this.view!.type });
    }
  }
}
