import GlobalStore from "@/engine/core/modules/globalStore";
import { PassManifold } from "@/preload/globalLinks";

export default class CanvasController {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: HTMLImageElement;
  scalar: number;
  selected: Position2D;
  canvasID: string;
  tileSize: Size2D;
  gridSize: Size2D;
  constructor(
    canvas: HTMLCanvasElement,
    image: string,
    canvasID: string,
    tileSize: Size2D
  ) {
    //TODO: to moze byc jeden kontroler i po prostu zmienia co jest na canvasie i jaki jest crop podczas zmiany tekstury
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.loadImage(image);
    this.canvas.addEventListener("click", (e) => this.inputs(e));
    this.scalar = 1;
    this.selected = { x: -1, y: -1 };
    this.canvasID = canvasID;
    this.tileSize = tileSize;
  }
  public scaleCanvas(scalar: number) {
    this.scalar = scalar;
    this.canvas.width = this.canvas.width * 2;
    this.canvas.height = this.canvas.height * 2;
    this.drawBackground();
  }
  public getSelected() {}
  private loadImage(src: string) {
    const img = new Image();
    img.onload = () => {
      this.texture = img;
      this.canvas.width = img.width;
      this.canvas.height = img.height;
      this.ctx.drawImage(img, 0, 0, img.width, img.height);
      //   this.scaleCanvas(2);
    };
    img.src = src;
  }
  private drawBackground() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(
      this.texture,
      0,
      0,
      this.texture.width,
      this.texture.height
    );
  }
  private drawSelected(x: number, y: number) {
    this.ctx.strokeStyle = "red";
    this.ctx.strokeRect(x, y, this.tileSize.w, this.tileSize.h);
    this.ctx.stroke();
  }
  private inputs(event: MouseEvent) {
    const mousePos = { x: event.offsetX, y: event.offsetY };
    const tile = this.getTileCoordinates(mousePos);
    this.drawBackground();
    const [_, setter] = GlobalStore.get<PassManifold>("passManifold");
    setter({
      textureID: this.canvasID,
      tileCropIndex: this.getTileIndex(tile),
      tileSize: this.tileSize,
      textureSize: { w: this.texture.width, h: this.texture.height },
      gridPos: { x: tile.x, y: tile.y },
    });
    this.selected = tile;
    this.drawSelected(tile.x, tile.y);
  }
  private getTileCoordinates(mousePos: Position2D) {
    const x = Math.floor(mousePos.x / this.tileSize.w) * this.tileSize.w;
    const y = Math.floor(mousePos.y / this.tileSize.h) * this.tileSize.h;
    return { x, y };
  }
  private getTileIndex(tilePos: Position2D): number {
    const tilesPerRow = Math.floor(this.texture.width / this.tileSize.w);
    const row = Math.floor(tilePos.y / this.tileSize.h);
    const col = Math.floor(tilePos.x / this.tileSize.w);
    return row * tilesPerRow + col;
  }
}
