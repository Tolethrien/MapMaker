import { loadImage } from "@/utils/utils";
export type Selector = "path" | "collider" | "anchor" | "included";
export type Tile = {
  position: Position2D;
  collider: boolean;
  included: boolean;
};
export default class Can {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  img!: HTMLImageElement;
  tileSize: Size2D;
  selector: Selector;
  LUT: Map<number, Tile>;
  gridAlpha: number;
  mouseSnap: Position2D & { dragged: undefined | number };
  static COLORS = {
    included: [255, 0, 0],
    grid: [255, 255, 255],
    collider: [0, 255, 0],
  };
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
  }

  public setSelector(selector: Selector) {
    this.selector = selector;
  }
  public getLUT() {
    return this.LUT;
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
  public restoreState(selector: Selector) {
    if (selector === "included")
      this.LUT.forEach((tile) => (tile.included = true));
    else if (selector === "collider")
      this.LUT.forEach((tile) => (tile.collider = false));

    this.drawCanvas();
  }
  private getColor(mode: keyof typeof Can.COLORS) {
    const color = Can.COLORS[mode];
    return `rgba(${color[0]},${color[1]},${color[2]},${this.gridAlpha})`;
  }
  private processMouseInput(event: MouseEvent) {
    if (event.button !== this.mouseSnap.dragged) return;

    const tiles = this.getTilesInBox({ x: event.offsetX, y: event.offsetY });

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
    if (this.mouseSnap.dragged !== undefined) return;
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
        this.LUT.set(index, {
          collider: false,
          included: true,
          position: { x: x * sizeX, y: y * sizeY },
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
        this.ctx.strokeRect(tile.position.x, tile.position.y, sizeX, sizeY);
        if (!tile.collider) return;
        this.ctx.strokeStyle = this.getColor("collider");
        this.ctx.strokeRect(
          tile.position.x + sizeX / 2 - 1,
          tile.position.y + sizeY / 2 - 1,
          2,
          2
        );
      });
  }
  // private getTileCoordinates(mousePos: Position2D) {
  //   const x = Math.floor(mousePos.x / this.tileSize.w) * this.tileSize.w;
  //   const y = Math.floor(mousePos.y / this.tileSize.h) * this.tileSize.h;
  //   return { x, y };
  // }

  private getTilesInBox(snapPos: Position2D): number[] {
    const tiles = [];
    const gridWidth = Math.floor(this.img.width / this.tileSize.w);

    const startIndex = this.getTileIndex(this.mouseSnap, gridWidth);
    const endIndex = this.getTileIndex(snapPos, gridWidth);

    const startX = Math.min(startIndex % gridWidth, endIndex % gridWidth);
    const endX = Math.max(startIndex % gridWidth, endIndex % gridWidth);
    const startY = Math.min(
      Math.floor(startIndex / gridWidth),
      Math.floor(endIndex / gridWidth)
    );
    const endY = Math.max(
      Math.floor(startIndex / gridWidth),
      Math.floor(endIndex / gridWidth)
    );

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        tiles.push(y * gridWidth + x);
      }
    }
    return tiles;
  }
  private getTileIndex(tilePos: Position2D, gridWidth: number): number {
    const row = Math.floor(tilePos.y / this.tileSize.h);
    const col = Math.floor(tilePos.x / this.tileSize.w);
    return row * gridWidth + col;
  }
}
