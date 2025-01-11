import { TextureViewSelected } from "@/API/links";
import Link from "@/vault/link";

export default class CanvasController {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: HTMLImageElement;
  scalar: number;
  selected: Position2D;
  canvasIndex: number;
  tileSize: Size2D;
  constructor(
    canvas: HTMLCanvasElement,
    image: string,
    index: number,
    tileSize: Size2D
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.loadImage(image);
    this.canvas.addEventListener("click", (e) => this.inputs(e));
    this.scalar = 1;
    this.selected = { x: -1, y: -1 };
    this.canvasIndex = index;
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
    this.selected = tile;
    Link.set<TextureViewSelected>("textureViewSelected")({
      index: this.canvasIndex,
      position: { x: tile.x, y: tile.y },
      tileSize: this.tileSize,
      textureSize: { w: this.texture.width, h: this.texture.height },
    });
    console.log(this.texture.width, this.texture.height);
    console.log(tile.x, tile.y);
    this.drawSelected(tile.x, tile.y);
  }
  private getTileCoordinates(mousePos: Position2D) {
    const x = Math.floor(mousePos.x / this.tileSize.w) * this.tileSize.w;
    const y = Math.floor(mousePos.y / this.tileSize.h) * this.tileSize.h;
    return { x, y };
  }
}
