import { TileCanvasExport } from "@/engine/core/modules/assetsManager";
import MathU from "@/math/math";
import { loadImage } from "@/utils/utils";
export type TileSelector = "path" | "collider" | "anchor" | "included";

export default class TileCanvas {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  img!: HTMLImageElement;
  tileSize: Size2D;
  selector: TileSelector;
  LUT: Map<number, TileCanvasExport>;
  gridAlpha: number;
  mouseSnap: Position2D & { dragged: undefined | number };
  static COLORS = {
    included: [255, 0, 0],
    grid: [255, 255, 255],
    collider: [0, 255, 0],
  };
  static BASE_ALPHA = 150;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.tileSize = { w: 16, h: 16 };
    this.selector = "included";
    this.LUT = new Map();
    this.mouseSnap = { x: 0, y: 0, dragged: undefined };
    this.gridAlpha = 0;
    this.canvas.addEventListener("mousedown", (e) => this.saveMousePosition(e));
    this.canvas.addEventListener("mouseup", (e) => this.processMouseInput(e));
    this.canvas.addEventListener("mousemove", (e) => this.drawMouseAABB(e));
    this.setGridAlpha(TileCanvas.BASE_ALPHA);
  }

  public setSelector(selector: TileSelector) {
    this.selector = selector;
  }
  public exportLUT() {
    return Array.from(this.LUT.values());
  }
  public setGridAlpha(value: number) {
    this.gridAlpha = value / 255;
    this.drawCanvas();
  }

  public async generateImage(path: string) {
    const img = await loadImage(`media:${path}`);
    this.img = img;
    this.canvas.width = img.width;
    this.canvas.height = img.height;
    this.generateLUT();
    this.drawCanvas();
  }
  public changeDims(dims: Size2D) {
    this.tileSize = dims;
    this.generateLUT();
    this.drawCanvas();
  }
  public restoreState(selector: TileSelector) {
    if (selector === "included")
      this.LUT.forEach((tile) => (tile.included = true));
    else if (selector === "collider")
      this.LUT.forEach((tile) => (tile.collider = false));

    this.drawCanvas();
  }
  private getColor(mode: keyof typeof TileCanvas.COLORS) {
    const color = TileCanvas.COLORS[mode];
    return `rgba(${color[0]},${color[1]},${color[2]},${this.gridAlpha})`;
  }
  private processMouseInput(event: MouseEvent) {
    if (event.button !== this.mouseSnap.dragged) return;

    const gridWidth = Math.floor(this.img.width / this.tileSize.w);
    const tiles = MathU.getTilesInBox(
      {
        x: this.mouseSnap.x,
        y: this.mouseSnap.y,
        w: event.offsetX,
        h: event.offsetY,
      },
      gridWidth,
      this.tileSize
    );
    if (event.button === 0)
      tiles.forEach((tile) => this.changeState("left", tile));
    if (event.button === 2)
      tiles.forEach((tile) => this.changeState("right", tile));
    this.drawCanvas();
    this.mouseSnap = { x: 0, y: 0, dragged: undefined };
  }
  private changeState(action: "left" | "right", tileIndex: number) {
    const tile = this.LUT.get(tileIndex);
    if (!tile) return;
    if (this.selector === "included") tile.included = action === "right";
    else if (this.selector === "collider") tile.collider = action === "left";
  }
  private saveMousePosition(e: MouseEvent) {
    if (this.mouseSnap.dragged !== undefined || e.button !== 0) return;
    console.log(e);
    this.mouseSnap = { x: e.offsetX, y: e.offsetY, dragged: e.button };
  }
  private drawMouseAABB(event: MouseEvent) {
    if (this.mouseSnap.dragged === undefined) return;
    this.drawCanvas();
    this.ctx.strokeStyle = "rgba(0,255,0,1)";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      this.mouseSnap.x,
      this.mouseSnap.y,
      event.offsetX - this.mouseSnap.x,
      event.offsetY - this.mouseSnap.y
    );
  }
  private generateLUT() {
    const sizeX = this.tileSize.w > 4 ? this.tileSize.w : 4;
    const sizeY = this.tileSize.h > 4 ? this.tileSize.h : 4;
    this.LUT.clear();
    const cols = Math.floor(this.img.width / sizeX);
    const rows = Math.floor(this.img.height / sizeY);
    let index = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cropX = x * sizeX;
        const cropY = y * sizeY;
        this.LUT.set(index, {
          collider: false,
          included: true,
          crop: {
            x: cropX,
            y: cropY,
            w: cropX + this.tileSize.w,
            h: cropY + this.tileSize.h,
          },
        });
        index++;
      }
    }
  }

  private drawCanvas() {
    if (!this.img) return;
    const sizeX = this.tileSize.w > 4 ? this.tileSize.w : 4;
    const sizeY = this.tileSize.h > 4 ? this.tileSize.h : 4;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.img, 0, 0);
    this.ctx.lineWidth = 2;
    Array.from(this.LUT.values())
      .sort((a, b) => -a.included - -b.included)
      .forEach((tile) => {
        if (tile.included) this.ctx.strokeStyle = this.getColor("grid");
        else this.ctx.strokeStyle = this.getColor("included");
        this.ctx.strokeRect(tile.crop.x, tile.crop.y, sizeX, sizeY);
        if (!tile.collider) return;
        this.ctx.strokeStyle = this.getColor("collider");
        this.ctx.strokeRect(
          tile.crop.x + sizeX / 2 - 1,
          tile.crop.y + sizeY / 2 - 1,
          2,
          2
        );
      });
  }
}
