import { loadImage } from "@/utils/utils";
import { Structure } from "./objectStructure";
export type ObjectSelector = "path" | "collider" | "anchor";

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

const MOUSE_MANI_TEMP = {
  buttonPressed: 0,
  mode: undefined,
  position: { x: 0, y: 0 },
  structure: undefined,
} as const;
const COLORS = {
  grid: [255, 255, 255],
  struct: [255, 0, 0],
  AABBPath: [0, 255, 0],
  AABBCollider: [150, 205, 50],
  edit: [0, 0, 255],
  collider: [255, 255, 0],
  anchor: [0, 255, 255],
} as const;
//TODO: maybe a static class? your using it only once anyway
//TODO: alpha on all selectors not one general
export default class ObjectCanvas {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  img!: HTMLImageElement;
  tileSize: Size2D;
  selector: ObjectSelector;
  LUT: Map<string, Structure>;
  gridAlpha: number;
  gridWidth: number;
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
    this.gridAlpha = 1;
    this.updateUI = undefined;
    this.gridWidth = 1;
    this.canvas.addEventListener("mousedown", (event) =>
      this.pathSavePosition(event)
    );
    this.canvas.addEventListener("mouseup", (e) => this.processMouseInput(e));
    this.canvas.addEventListener("mousemove", (e) => this.drawMouseAABB(e));
  }

  public setSelector(selector: ObjectSelector) {
    this.selector = selector;
  }
  public getLUT() {
    return Array.from(this.LUT.values());
  }
  public setGridAlpha(value: number) {
    this.gridAlpha = value / 255;
    this.redraw();
  }
  public deleteStructure(id: string) {
    this.LUT.delete(id);
    this.redraw();
    this.updateUI?.();
  }

  public async generateImage(path: string) {
    const img = await loadImage(`media:${path}`);
    this.img = img;
    this.canvas.width = img.width;
    this.canvas.height = img.height;
    this.redraw();
  }
  public changeDims(dims: Size2D) {
    this.tileSize = dims;
    this.gridWidth = Math.floor(this.img.width / this.tileSize.w);
    Structure.tileSize = dims;
    this.LUT.clear();
    this.updateUI?.();
    this.redraw();
  }

  public onLUTChange(func: () => void) {
    this.updateUI = func;
  }

  private pathSavePosition(event: MouseEvent) {
    if (this.mouseManifest.mode !== undefined) return;
    if (this.selector === "collider" || this.selector === "anchor") {
      const tile = this.getTileIndexFromPosition({
        x: event.offsetX,
        y: event.offsetY,
      });
      const struct = Array.from(this.LUT.values()).find((struct) =>
        struct.includedTiles.has(tile)
      );
      if (!struct) return;
      this.mouseManifest = {
        position: { x: event.offsetX, y: event.offsetY },
        buttonPressed: event.button,
        mode: "creator",
        structure: undefined,
      };
    } else {
      const draggedStruct = Array.from(this.LUT.values()).find((struct) =>
        struct.isDragged({ x: event.offsetX, y: event.offsetY }, 6)
      );
      if (draggedStruct) {
        this.mouseManifest = {
          position: { x: event.offsetX, y: event.offsetY },
          buttonPressed: event.button,
          mode: "editor",
          structure: draggedStruct,
        };
      } else
        this.mouseManifest = {
          position: { x: event.offsetX, y: event.offsetY },
          buttonPressed: event.button,
          mode: "creator",
          structure: undefined,
        };
    }
  }
  private processMouseInput(event: MouseEvent) {
    if (event.button !== this.mouseManifest.buttonPressed) return;
    if (this.selector === "path") this.processPath(event);
    else if (this.selector === "collider") this.processCollider(event);
    else if (this.selector === "anchor") this.processAnchor(event);
    this.redraw();
    this.updateUI?.();
    this.mouseManifest = MOUSE_MANI_TEMP;
  }
  private processCollider(event: MouseEvent) {
    const tileACoords = this.getTileCoordinates({
      x: this.mouseManifest.position.x,
      y: this.mouseManifest.position.y,
    });
    const tileBCoords = this.getTileCoordinates({
      x: event.offsetX,
      y: event.offsetY,
    });
    const tileAIndex = this.getTileIndex(tileACoords);
    const tileBIndex = this.getTileIndex(tileBCoords);
    const struct = Array.from(this.LUT.values()).find(
      (struct) =>
        struct.includedTiles.has(tileAIndex) &&
        struct.includedTiles.has(tileBIndex)
    );
    if (!struct) return;
    if (this.mouseManifest.buttonPressed === 2) {
      struct.deleteCollider();
    } else {
      struct.setCollider(tileACoords, tileBCoords);
      const colliderIndexes = this.getTilesInBox(struct.pointsCollider);
      struct.colliderTiles = new Set(colliderIndexes);
    }
  }
  private processAnchor(event: MouseEvent) {
    const anchorCoords = this.getTileCoordinates({
      x: event.offsetX,
      y: event.offsetY,
    });
    const anchorIndex = this.getTileIndex(anchorCoords);
    const struct = Array.from(this.LUT.values()).find((struct) =>
      struct.includedTiles.has(anchorIndex)
    );
    if (!struct) return;
    if (this.mouseManifest.buttonPressed === 2) {
      struct.deleteAnchor();
    } else {
      struct.setAnchor(anchorCoords);
      struct.anchorTile = anchorIndex;
    }
  }
  private processPath(event: MouseEvent) {
    if (this.mouseManifest.buttonPressed == 2) {
      const mouseOnTile = this.getTileCoordinates({
        x: event.offsetX,
        y: event.offsetY,
      });
      const tileIndex = this.getTileIndex(mouseOnTile);
      const struct = Array.from(this.LUT.values()).find((struct) =>
        struct.includedTiles.has(tileIndex)
      );
      if (!struct) return;
      this.LUT.delete(struct.getID);
      return;
    }
    let struct: Structure;
    if (this.mouseManifest.mode === "editor") {
      struct = this.mouseManifest.structure;
      const mouseToTile = this.getTileCoordinates({
        x: event.offsetX,
        y: event.offsetY,
      });
      struct.recalculateObject(mouseToTile);
    } else {
      const tileA = this.getTileCoordinates(this.mouseManifest.position);
      const tileB = this.getTileCoordinates({
        x: event.offsetX,
        y: event.offsetY,
      });
      struct = new Structure(tileA, tileB);
    }
    const includedIndexes = this.getTilesInBox(struct.pointsPath);
    struct.includedTiles = new Set(includedIndexes);
    this.LUT.set(struct.getID, struct);
  }

  private drawMouseAABB(event: MouseEvent) {
    if (
      this.mouseManifest.mode === undefined ||
      this.selector === "anchor" ||
      this.mouseManifest.buttonPressed !== 0
    )
      return;
    this.redraw();
    if (this.mouseManifest.mode === "editor") {
      const struct = this.mouseManifest.structure;

      const pointA =
        this.selector === "path"
          ? struct.pointsPath.A
          : struct.pointsCollider.A;
      const pointB =
        this.selector === "path"
          ? struct.pointsPath.B
          : struct.pointsCollider.B;
      const dragPoint = this.mouseManifest.structure.dragPoint;
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = this.getColor("edit", false);
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
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle =
        this.selector === "path"
          ? this.getColor("AABBPath", false)
          : this.getColor("AABBCollider", false);
      this.ctx.strokeRect(
        this.mouseManifest.position.x,
        this.mouseManifest.position.y,
        event.offsetX - this.mouseManifest.position.x,
        event.offsetY - this.mouseManifest.position.y
      );
    }
  }

  private drawGrid() {
    const sizeX = this.tileSize.w > 4 ? this.tileSize.w : 4;
    const sizeY = this.tileSize.h > 4 ? this.tileSize.h : 4;
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = this.getColor("grid", true);
    for (let x = 0; x < this.canvas.width; x += sizeX) {
      for (let y = 0; y < this.canvas.height; y += sizeY) {
        this.ctx.strokeRect(x, y, sizeX, sizeY);
      }
    }
  }
  private drawStructures() {
    //TODO: change draw order base on selector
    this.ctx.lineWidth = 2;
    this.LUT.forEach((structure) => {
      //struct
      const path = structure.pointsPath;
      this.ctx.strokeStyle = this.getColor("struct");
      this.ctx.strokeRect(
        path.A.x,
        path.A.y,
        path.B.x - path.A.x,
        path.B.y - path.A.y
      );
      //editor dots
      this.ctx.beginPath();
      this.ctx.ellipse(path.A.x, path.A.y, 6, 6, Math.PI / 4, 0, 2 * Math.PI);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.ellipse(path.B.x, path.B.y, 6, 6, Math.PI / 4, 0, 2 * Math.PI);
      this.ctx.stroke();
      //collider
      this.ctx.strokeStyle = this.getColor("collider");
      const collider = structure.pointsCollider;
      this.ctx.strokeRect(
        collider.A.x,
        collider.A.y,
        collider.B.x - collider.A.x,
        collider.B.y - collider.A.y
      );
      //anchor
      if (structure.anchorTile === undefined) return;
      this.ctx.strokeStyle = this.getColor("anchor");
      const anchor = structure.pointsAnchor;
      this.ctx.strokeRect(anchor.x, anchor.y, this.tileSize.w, this.tileSize.h);
    });
  }
  private drawBase() {
    this.ctx.drawImage(this.img, 0, 0);
  }
  private redraw() {
    if (!this.img) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBase();
    this.drawGrid();
    this.drawStructures();
  }

  private getTilesInBox(box: Structure["pointsPath"]): number[] {
    const tiles = [];
    const startIndex = this.getTileIndex(box.A);
    const endIndex = this.getTileIndex({ x: box.B.x - 1, y: box.B.y - 1 });
    const startX = Math.min(
      startIndex % this.gridWidth,
      endIndex % this.gridWidth
    );
    const endX = Math.max(
      startIndex % this.gridWidth,
      endIndex % this.gridWidth
    );
    const startY = Math.min(
      Math.floor(startIndex / this.gridWidth),
      Math.floor(endIndex / this.gridWidth)
    );
    const endY = Math.max(
      Math.floor(startIndex / this.gridWidth),
      Math.floor(endIndex / this.gridWidth)
    );

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        tiles.push(y * this.gridWidth + x);
      }
    }
    return tiles;
  }
  private getTileIndex(tilePos: Position2D): number {
    const row = Math.floor(tilePos.y / this.tileSize.h);
    const col = Math.floor(tilePos.x / this.tileSize.w);
    return row * this.gridWidth + col;
  }
  private getTileCoordinates(mousePos: Position2D) {
    const x = Math.floor(mousePos.x / this.tileSize.w) * this.tileSize.w;
    const y = Math.floor(mousePos.y / this.tileSize.h) * this.tileSize.h;
    return { x, y };
  }
  private getTileIndexFromPosition(position: Position2D) {
    const pos = this.getTileCoordinates(position);
    return this.getTileIndex(pos);
  }

  private getColor(type: keyof typeof COLORS, useAlpha: boolean = false) {
    const color = COLORS[type];
    if (useAlpha)
      return `rgba(${color[0]},${color[1]},${color[2]},${this.gridAlpha})`;
    else return `rgba(${color[0]},${color[1]},${color[2]},1)`;
  }
}
