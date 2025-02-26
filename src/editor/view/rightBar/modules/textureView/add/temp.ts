import { loadImage } from "@/utils/utils";
export type Selector = "path" | "collider" | "anchor" | "included";
type Tile = { position: Position2D; collider: boolean; included: boolean };
export default class Can {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  img!: HTMLImageElement;
  tileSize: Size2D;
  selector: Selector;
  LUT: Map<number, Tile>;
  static COLORS = {
    included: "rgba(255,0,0,1)",
    grid: "rgba(255,255,255,1)",
    collider: "rgba(0,255,1)",
  };
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.tileSize = { w: 16, h: 16 };
    this.selector = "included";
    this.LUT = new Map();
    this.canvas.addEventListener("click", (e) => this.mouseEvents(e));
  }
  public setSelector(selector: Selector) {
    this.selector = selector;
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
  private generateLUT() {
    const sizeX = this.tileSize.w > 4 ? this.tileSize.w : 4;
    const sizeY = this.tileSize.h > 4 ? this.tileSize.h : 4;
    this.LUT.clear();
    const cols = Math.floor(this.img.width / sizeX);
    const rows = Math.floor(this.img.height / sizeY);
    let index = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        this.LUT.set(index, {
          collider: false,
          included: true,
          position: { x: x * sizeX, y: y * sizeY },
        });
        index++;
      }
    }
  }
  private mouseEvents(event: MouseEvent) {
    const mousePos = { x: event.offsetX, y: event.offsetY };
    const tile = this.getTileCoordinates(mousePos);
    const index = this.getTileIndex(tile);
    const tileData = this.LUT.get(index);
    if (!tileData) return;
    if (this.selector === "included") tileData.included = !tileData.included;
    else if (this.selector === "collider")
      tileData.collider = !tileData.collider;
    this.drawCanvas();
  }

  private drawCanvas() {
    if (!this.img) return;
    const sizeX = this.tileSize.w > 4 ? this.tileSize.w : 4;
    const sizeY = this.tileSize.h > 4 ? this.tileSize.h : 4;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.img, 0, 0);
    this.LUT.forEach((tile) => {
      if (tile.included) this.ctx.strokeStyle = Can.COLORS.grid;
      else this.ctx.strokeStyle = Can.COLORS.included;
      this.ctx.strokeRect(tile.position.x, tile.position.y, sizeX, sizeY);
      if (!tile.collider) return;
      this.ctx.strokeStyle = Can.COLORS.included;
      this.ctx.strokeRect(
        tile.position.x + sizeX / 2 - 1,
        tile.position.y + sizeY / 2 - 1,
        2,
        2
      );
    });
  }
  private getTileCoordinates(mousePos: Position2D) {
    const x = Math.floor(mousePos.x / this.tileSize.w) * this.tileSize.w;
    const y = Math.floor(mousePos.y / this.tileSize.h) * this.tileSize.h;
    return { x, y };
  }
  private getTileIndex(tilePos: Position2D): number {
    const tilesPerRow = Math.floor(this.img.width / this.tileSize.w);
    const row = Math.floor(tilePos.y / this.tileSize.h);
    const col = Math.floor(tilePos.x / this.tileSize.w);
    return row * tilesPerRow + col;
  }
}
