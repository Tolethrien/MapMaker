import Vec2D from "@/math/vec2D";
import Vec4D from "@/math/vec4D";
import { loadImage } from "@/utils/utils";
export type Selector = "path" | "collider" | "anchor" | "included";
type DragPoint = "a" | "b";
type MouseEventInfo = {
  position: Position2D;
  buttonPressed: number;
};
type MouseManifest =
  | (MouseEventInfo & {
      mode: "editor";
      structure: Structure;
    })
  | (MouseEventInfo & {
      mode: "creator" | undefined;
      structure: undefined;
    });
export class Structure {
  //TODO: przerobic to na vec4 bo 4 punkty i nie musisz miec 2 wartosci
  private objectVec: Vec4D;
  private colliderVec: Vec4D;
  private anchorVec: Vec4D;
  private vecA: Vec2D;
  private vecB: Vec2D;
  private id: string;
  public dragPoint: DragPoint;
  public includedTiles: Set<number>;
  public colliderTiles: Set<number>;
  public anchorTile: number;
  constructor(pointA: Position2D, pointB: Position2D, tileSize: Size2D) {
    this.id = crypto.randomUUID();
    this.vecA = Vec2D.create([
      Math.min(pointA.x, pointB.x),
      Math.min(pointA.y, pointB.y),
    ]);
    this.vecB = Vec2D.create([
      Math.max(pointA.x, pointB.x) + tileSize.w,
      Math.max(pointA.y, pointB.y) + tileSize.h,
    ]);
    this.dragPoint = "b";
    this.includedTiles = new Set();
  }
  public get pointA() {
    return this.vecA.get;
  }
  public get pointB() {
    return this.vecB.get;
  }
  public get vectorA() {
    return this.vecA;
  }
  public get vectorB() {
    return this.vecB;
  }
  public get getID() {
    return this.id;
  }
  public setPoint(point: DragPoint, val: Position2D, tileSize: Size2D) {
    if (point === "a") this.vecA = Vec2D.create([val.x, val.y]);
    else this.vecB = Vec2D.create([val.x + tileSize.w, val.y + tileSize.h]);
  }
  public recalculatePoints(val: Position2D, tileSize: Size2D) {
    if (
      this.dragPoint === "a" &&
      val.x < this.pointB.x &&
      val.y < this.pointB.y
    )
      this.vecA = Vec2D.create([val.x, val.y]);
    else if (
      this.dragPoint === "b" &&
      val.x > this.pointA.x &&
      val.y > this.pointA.y
    )
      this.vecB = Vec2D.create([val.x + tileSize.w, val.y + tileSize.h]);
  }
  public isDragged(mouse: Position2D, dist: number) {
    const mouseVec = Vec2D.create([mouse.x, mouse.y]);
    const draggedA = this.vecA.distanceToOtherVec2D(mouseVec);
    const draggedB = this.vecB.distanceToOtherVec2D(mouseVec);
    if (draggedA < dist) this.dragPoint = "a";
    else if (draggedB < dist) this.dragPoint = "b";
    return true;
  }

  public getPoints() {
    return [this.pointA.x, this.pointA.y, this.pointB.x, this.pointB.y];
  }
}
const MOUSE_MANI_TEMP = {
  buttonPressed: 0,
  mode: undefined,
  position: { x: 0, y: 0 },
  structure: undefined,
} as const;
//TODO: czy to musza byc klasy takie a nie statyczne? i tak tylko raz uzywasz
export default class ObjectCanvas {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  img!: HTMLImageElement;
  tileSize: Size2D;
  selector: Selector;
  LUT: Map<string, Structure>;
  gridAlpha: number;
  currentStructure: Structure | undefined;
  mouseManifest: MouseManifest;
  updateUI: (() => void) | undefined;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.tileSize = { w: 16, h: 16 };
    this.selector = "path";
    this.LUT = new Map();
    this.mouseManifest = MOUSE_MANI_TEMP;
    this.gridAlpha = 0;
    this.updateUI = undefined;
    this.canvas.addEventListener("mousedown", (e) => this.saveMousePosition(e));
    this.canvas.addEventListener("mouseup", (e) => this.processMouseInput(e));
    this.canvas.addEventListener("mousemove", (e) => this.drawMouseAABB(e));
  }

  public setSelector(selector: Selector) {
    this.selector = selector;
  }
  public getLUT() {
    return Array.from(this.LUT.values());
  }
  public setGridAlpha(value: number) {
    this.gridAlpha = value / 255;
    this.drawCanvas();
  }
  public deleteStructure(id: string) {
    this.LUT.delete(id);
    this.drawCanvas();
    this.updateUI?.();
  }

  public async generateImage(path: string) {
    const img = await loadImage(`media:${path}`);
    this.img = img;
    this.canvas.width = img.width;
    this.canvas.height = img.height;
    this.drawCanvas();
  }
  public changeDims(dims: Size2D) {
    this.tileSize = dims;
    this.drawCanvas();
  }

  public onLUTChange(func: () => void) {
    this.updateUI = func;
  }
  private saveMousePosition(e: MouseEvent) {
    if (this.mouseManifest.mode !== undefined) return;
    const draggedStruct = Array.from(this.LUT.values()).find((struct) =>
      struct.isDragged({ x: e.offsetX, y: e.offsetY }, 6)
    );
    if (draggedStruct)
      this.mouseManifest = {
        position: { x: e.offsetX, y: e.offsetY },
        buttonPressed: e.button,
        mode: "editor",
        structure: draggedStruct,
      };
    else
      this.mouseManifest = {
        position: { x: e.offsetX, y: e.offsetY },
        buttonPressed: e.button,
        mode: "creator",
        structure: undefined,
      };
  }
  private processMouseInput(event: MouseEvent) {
    if (event.button !== this.mouseManifest.buttonPressed) return;
    let struct: Structure;
    if (this.mouseManifest.mode === "editor") {
      struct = this.mouseManifest.structure;
      const mouseToTile = this.getTileCoordinates({
        x: event.offsetX,
        y: event.offsetY,
      });
      struct.recalculatePoints(mouseToTile, this.tileSize);
    } else {
      const tileA = this.getTileCoordinates(this.mouseManifest.position);
      const tileB = this.getTileCoordinates({
        x: event.offsetX,
        y: event.offsetY,
      });
      struct = new Structure(tileA, tileB, this.tileSize);
    }
    const includedIndexes = this.getTilesInBox(struct);
    struct.includedTiles = new Set(includedIndexes);
    this.LUT.set(struct.getID, struct);
    this.drawCanvas();
    this.updateUI?.();
    this.mouseManifest = MOUSE_MANI_TEMP;
  }
  //TODO: przeniesc to do structure?
  private inBoundAABB(point: DragPoint, struct: Structure, event: MouseEvent) {
    if (struct.dragPoint !== point) return;
    if (point === "a")
      return event.offsetX < struct.pointB.x && event.offsetY < struct.pointB.y;
    else
      return event.offsetX > struct.pointA.x && event.offsetY > struct.pointA.y;
  }
  private drawMouseAABB(event: MouseEvent) {
    if (this.mouseManifest.mode === undefined) return;
    this.drawCanvas();
    if (this.mouseManifest.mode === "editor") {
      const pointA = this.mouseManifest.structure.pointA;
      const pointB = this.mouseManifest.structure.pointB;
      const dragPoint = this.mouseManifest.structure.dragPoint;
      this.ctx.strokeStyle = "rgba(0,0,255,1)";
      this.ctx.lineWidth = 2;
      if (dragPoint === "a")
        this.ctx.strokeRect(
          pointB.x,
          pointB.y,
          pointA.x - pointB.x + event.offsetX - pointA.x,
          pointA.y - pointB.y + event.offsetY - pointA.y
        );
      else
        this.ctx.strokeRect(
          pointA.x,
          pointA.y,
          pointB.x - pointA.x + event.offsetX - pointB.x,
          pointB.y - pointA.y + event.offsetY - pointB.y
        );
    } else if (this.mouseManifest.mode === "creator") {
      this.ctx.strokeStyle = "rgba(0,255,0,1)";
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(
        this.mouseManifest.position.x,
        this.mouseManifest.position.y,
        event.offsetX - this.mouseManifest.position.x,
        event.offsetY - this.mouseManifest.position.y
      );
    }
  }

  private drawCanvas() {
    if (!this.img) return;
    const sizeX = this.tileSize.w > 4 ? this.tileSize.w : 4;
    const sizeY = this.tileSize.h > 4 ? this.tileSize.h : 4;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.img, 0, 0);
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "rgb(255,255,255)";

    for (let x = 0; x < this.canvas.width; x += sizeX) {
      for (let y = 0; y < this.canvas.height; y += sizeY) {
        this.ctx.strokeRect(x, y, sizeX, sizeY);
      }
    }
    this.ctx.strokeStyle = "rgb(255,0,0)";
    this.LUT.forEach((structure) => {
      const path = structure.getPoints();
      this.ctx.strokeRect(
        path[0],
        path[1],
        path[2] - path[0],
        path[3] - path[1]
      );
      this.ctx.beginPath();
      this.ctx.ellipse(path[2], path[3], 6, 6, Math.PI / 4, 0, 2 * Math.PI);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.ellipse(path[0], path[1], 6, 6, Math.PI / 4, 0, 2 * Math.PI);
      this.ctx.stroke();
    });
  }
  private getTileCoordinates(mousePos: Position2D) {
    const x = Math.floor(mousePos.x / this.tileSize.w) * this.tileSize.w;
    const y = Math.floor(mousePos.y / this.tileSize.h) * this.tileSize.h;
    return { x, y };
  }

  private getTilesInBox(struct: Structure): number[] {
    const tiles = [];
    const gridWidth = Math.floor(this.img.width / this.tileSize.w);
    const startIndex = this.getTileIndex(struct.pointA, gridWidth);
    const endIndex = this.getTileIndex(
      struct.vectorB.sub([1, 1]).get,
      gridWidth
    );
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
