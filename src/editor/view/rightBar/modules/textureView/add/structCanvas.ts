import { loadImage } from "@/utils/utils";
import ShelfPack from "@/math/shelfPack";
import MathU from "@/math/math";
import { StructureCanvasExport } from "@/engine/core/modules/assetsManager";
import EngineDebugger from "@/engine/core/modules/debugger";

export type ObjectSelector = "path" | "collider" | "anchor";
export interface Structure {
  id: string;
  colliderTiles: Set<number>;
  anchorTile: number | undefined;
  includedTiles: Set<number>;
  objectTileSize: Size2D;
  pathPoints: Box2D;
  colliderPoints: Box2D;
  anchorPoints: Box2D;
}
type MouseManifest = {
  position: Position2D;
  buttonPressed: number;
  mode: "editor" | "creator" | undefined;
  structure: Structure | undefined;
  dragPoint: "a" | "b" | undefined;
};

const MOUSE_MANI_TEMP: MouseManifest = {
  buttonPressed: 0,
  mode: undefined,
  position: { x: 0, y: 0 },
  structure: undefined,
  dragPoint: undefined,
} as const;
const PACK_SIZE = { w: 1200, h: 900 };
const COLORS = {
  grid: [255, 255, 255],
  struct: [255, 0, 0],
  AABBPath: [0, 255, 0],
  AABBCollider: [150, 205, 50],
  edit: [0, 0, 255],
  collider: [255, 255, 0],
  anchor: [0, 255, 255],
} as const;

export default class StrCa {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  img!: HTMLImageElement;
  tileSize: Size2D;
  selector: ObjectSelector;
  LUT: Map<string, Structure>;
  gridAlpha: number;
  gridWidth: number;
  mouseManifest: MouseManifest;
  updateUI: (() => void) | undefined;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.tileSize = { w: 16, h: 16 };
    this.gridAlpha = 1;
    this.selector = "path";
    this.LUT = new Map();
    this.mouseManifest = MOUSE_MANI_TEMP;

    this.canvas.addEventListener("mousedown", (e) => this.pathSavePosition(e));
    this.canvas.addEventListener("mousemove", (e) => this.drawMouseAABB(e));
    this.canvas.addEventListener("mouseup", (e) => this.processMouseInput(e));
  }
  public getLut() {
    return Array.from(this.LUT.values());
  }
  public setGridAlpha(value: number) {
    this.gridAlpha = value / 255;
    this.redraw();
  }
  public setSelector(selector: ObjectSelector) {
    this.selector = selector;
  }
  public exportLUT(): StructureCanvasExport[] {
    const pack = new ShelfPack(PACK_SIZE.w, PACK_SIZE.h);
    const boxesToSort: { box: Box2D; id: string }[] = Array.from(
      this.LUT.values()
    ).map((struct) => {
      return {
        box: {
          x: 0,
          y: 0,
          w: struct.pathPoints.w - struct.pathPoints.x,
          h: struct.pathPoints.h - struct.pathPoints.y,
        },
        id: struct.id,
      };
    });
    const sortedBoxes = pack.insert(boxesToSort);
    return sortedBoxes.map((sortedBox) => {
      const struct = this.LUT.get(sortedBox.id)!;
      const { anchorTile, colliderTiles } =
        this.calculateExportedIncludedTiles(struct);
      return {
        onCanvasPosition: sortedBox.box,
        colliderTiles: colliderTiles,
        crop: struct.pathPoints,
        anchorTile: anchorTile,
        objectTileSize: struct.objectTileSize,
      };
    });
  }
  public changeDims(dims: Size2D) {
    this.tileSize = dims;
    this.gridWidth = Math.floor(this.img.width / this.tileSize.w);
    this.LUT.clear();
    this.updateUI?.();
    this.redraw();
  }
  public onLUTChange(func: () => void) {
    this.updateUI = func;
  }
  public async generateImage(path: string) {
    const img = await loadImage(`media:${path}`);
    this.img = img;
    this.canvas.width = img.width;
    this.canvas.height = img.height;
    this.redraw();
  }
  public deleteStructureByID(id: string) {
    this.LUT.delete(id);
    this.redraw();
    this.updateUI?.();
  }
  private pathSavePosition(event: MouseEvent) {
    if (this.mouseManifest.mode !== undefined) return;
    if (this.selector === "collider" || this.selector === "anchor") {
      if (!this.isMousePathCollide(event)) return;
      this.mouseManifest = {
        position: { x: event.offsetX, y: event.offsetY },
        buttonPressed: event.button,
        mode: "creator",
        structure: undefined,
        dragPoint: undefined,
      };
    } else this.isMousePathDragged(event);
  }

  private drawMouseAABB(event: MouseEvent) {
    if (
      this.mouseManifest.mode === undefined ||
      this.selector === "anchor" ||
      this.mouseManifest.buttonPressed !== 0
    )
      return;
    this.redraw();
    if (this.mouseManifest.mode === "editor") this.drawAABBEditor(event);
    else if (this.mouseManifest.mode === "creator") this.drawAABBCreator(event);
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
  private processPath(event: MouseEvent) {
    if (this.mouseManifest.buttonPressed == 2) {
      this.deleteStructureByMouse(event);
      return;
    }
    if (this.mouseManifest.mode === "editor") {
      EngineDebugger.assertValue(this.mouseManifest.structure, {
        msg: "there should be a struct assigned to mouseManifold in editor mode",
      });
      this.recalculateStruct(this.mouseManifest.structure.id, event);
    } else {
      this.createNewStruct(event);
    }
  }

  private processCollider(event: MouseEvent) {
    const mousePos = { x: event.offsetX, y: event.offsetY };
    const { pointA, pointB } = this.getRectangle(
      this.mouseManifest.position,
      mousePos
    );
    const tileAIndex = this.getTileIndex(pointA);
    const tileBIndex = this.getTileIndex(pointB);
    const struct = Array.from(this.LUT.values()).find(
      (struct) =>
        struct.includedTiles.has(tileAIndex) &&
        struct.includedTiles.has(tileBIndex)
    );
    if (!struct) return;
    if (this.mouseManifest.buttonPressed === 2) {
      struct.colliderTiles.clear();
      struct.colliderPoints = { x: 0, y: 0, w: 0, h: 0 };
      return;
    }
    const tiles = MathU.getTilesInBox(
      { x: pointA.x, y: pointA.y, w: pointB.x, h: pointB.y },
      this.gridWidth,
      this.tileSize
    );
    struct.colliderTiles = new Set(tiles);
    struct.colliderPoints = {
      x: pointA.x,
      y: pointA.y,
      w: pointB.x + this.tileSize.w,
      h: pointB.y + this.tileSize.h,
    };
  }
  private processAnchor(event: MouseEvent) {
    const mousePos = { x: event.offsetX, y: event.offsetY };
    const anchorCoords = this.getTileCoordinates(mousePos);
    const anchorIndex = this.getTileIndex(anchorCoords);
    const struct = Array.from(this.LUT.values()).find((struct) =>
      struct.includedTiles.has(anchorIndex)
    );
    if (!struct) return;
    if (this.mouseManifest.buttonPressed === 2) {
      struct.anchorTile = undefined;
      struct.anchorPoints = { x: 0, y: 0, w: 0, h: 0 };
      return;
    }
    struct.anchorTile = anchorIndex;
    struct.anchorPoints = {
      x: anchorCoords.x,
      y: anchorCoords.y,
      w: this.tileSize.w,
      h: this.tileSize.h,
    };
  }
  private isMousePathDragged(event: MouseEvent) {
    const mousePos = { x: event.offsetX, y: event.offsetY };
    const draggedStruct = Array.from(this.LUT.values()).find((struct) =>
      this.isDragged(struct, { x: event.offsetX, y: event.offsetY }, 6)
    );
    for (const struct of this.LUT.values()) {
      const dragPoint = this.isDragged(struct, mousePos, 6);
      if (dragPoint === undefined) continue;
      this.mouseManifest = {
        position: { x: event.offsetX, y: event.offsetY },
        buttonPressed: event.button,
        mode: draggedStruct !== undefined ? "editor" : "creator",
        structure: draggedStruct,
        dragPoint: dragPoint,
      };
      return;
    }
    this.mouseManifest = {
      position: { x: event.offsetX, y: event.offsetY },
      buttonPressed: event.button,
      mode: "creator",
      structure: undefined,
      dragPoint: undefined,
    };
  }

  private deleteStructureByMouse(event: MouseEvent) {
    const mouseOnTile = this.getTileCoordinates({
      x: event.offsetX,
      y: event.offsetY,
    });
    const tileIndex = this.getTileIndex(mouseOnTile);
    const struct = Array.from(this.LUT.values()).find((struct) =>
      struct.includedTiles.has(tileIndex)
    );
    if (!struct) return;
    this.LUT.delete(struct.id);
  }
  private drawAABBCreator(event: MouseEvent) {
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
  private drawAABBEditor(event: MouseEvent) {
    const points = this.mouseManifest.structure?.pathPoints;
    EngineDebugger.assertValue(points, {
      msg: "can't draw AABB Editor, no structure in mouseManifold",
    });
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = this.getColor("edit", false);
    if (this.mouseManifest.dragPoint === "a")
      this.ctx.strokeRect(
        points.w,
        points.h,
        points.x - points.w + event.offsetX - points.x,
        points.y - points.h + event.offsetY - points.y
      );
    else if (this.mouseManifest.dragPoint === "b")
      this.ctx.strokeRect(
        points.x,
        points.y,
        points.w - points.x + event.offsetX - points.w,
        points.h - points.y + event.offsetY - points.h
      );
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
    this.LUT.forEach(({ colliderPoints, pathPoints, anchorPoints }) => {
      //struct
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = this.getColor("struct");
      this.ctx.strokeRect(
        pathPoints.x,
        pathPoints.y,
        pathPoints.w - pathPoints.x,
        pathPoints.h - pathPoints.y
      );
      //editor dots
      this.ctx.beginPath();
      this.ctx.ellipse(
        pathPoints.x,
        pathPoints.y,
        6,
        6,
        Math.PI / 4,
        0,
        2 * Math.PI
      );
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.ellipse(
        pathPoints.w,
        pathPoints.h,
        6,
        6,
        Math.PI / 4,
        0,
        2 * Math.PI
      );
      this.ctx.stroke();
      // collider
      this.ctx.strokeStyle = this.getColor("collider");
      this.ctx.strokeRect(
        colliderPoints.x,
        colliderPoints.y,
        colliderPoints.w - colliderPoints.x,
        colliderPoints.h - colliderPoints.y
      );
      //anchor
      this.ctx.strokeStyle = this.getColor("anchor");
      this.ctx.strokeRect(
        anchorPoints.x,
        anchorPoints.y,
        anchorPoints.w,
        anchorPoints.h
      );
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
  private createNewStruct(event: MouseEvent) {
    const { pointA, pointB } = this.getRectangle(this.mouseManifest.position, {
      x: event.offsetX,
      y: event.offsetY,
    });
    const tiles = MathU.getTilesInBox(
      { x: pointA.x, y: pointA.y, w: pointB.x, h: pointB.y },
      this.gridWidth,
      this.tileSize
    );

    const struct: Structure = {
      id: crypto.randomUUID(),
      includedTiles: new Set(tiles),
      anchorTile: undefined,
      colliderTiles: new Set(),
      objectTileSize: {
        w: 1 + (pointB.x - pointA.x) / this.tileSize.w,
        h: 1 + (pointB.y - pointA.y) / this.tileSize.h,
      },
      pathPoints: {
        x: pointA.x,
        y: pointA.y,
        w: pointB.x + this.tileSize.w,
        h: pointB.y + this.tileSize.h,
      },
      colliderPoints: { x: 0, y: 0, w: 0, h: 0 },
      anchorPoints: { x: 0, y: 0, w: 0, h: 0 },
    };
    this.LUT.set(struct.id, struct);
  }
  private recalculateStruct(structID: string, event: MouseEvent) {
    const struct = this.LUT.get(structID)!;
    const mouseToTile = this.getTileCoordinates({
      x: event.offsetX,
      y: event.offsetY,
    });
    let newPoints!: Box2D;
    if (this.outOfBound(struct.pathPoints, mouseToTile)) return;
    if (this.mouseManifest.dragPoint === "a") {
      newPoints = {
        x: mouseToTile.x,
        y: mouseToTile.y,
        w: struct.pathPoints.w - this.tileSize.w,
        h: struct.pathPoints.h - this.tileSize.h,
      };
    } else if (this.mouseManifest.dragPoint === "b") {
      newPoints = {
        x: struct.pathPoints.x,
        y: struct.pathPoints.y,
        w: mouseToTile.x,
        h: mouseToTile.y,
      };
    }
    const tiles = MathU.getTilesInBox(newPoints, this.gridWidth, this.tileSize);
    struct.includedTiles = new Set(tiles);
    struct.objectTileSize = {
      w: 1 + (newPoints.w - struct.pathPoints.x) / this.tileSize.w,
      h: 1 + (newPoints.h - struct.pathPoints.y) / this.tileSize.h,
    };
    struct.pathPoints = {
      ...newPoints,
      w: newPoints.w + this.tileSize.w,
      h: newPoints.h + this.tileSize.h,
    };
  }
  private isMousePathCollide(event: MouseEvent) {
    const tile = MathU.getTileIndexFromPoint({
      point: { x: event.offsetX, y: event.offsetY },
      gridWidth: this.gridWidth,
      tileSize: this.tileSize,
    });
    const struct = Array.from(this.LUT.values()).find((struct) =>
      struct.includedTiles.has(tile)
    );
    if (struct) return true;
    else return false;
  }

  private isDragged(
    { pathPoints }: Structure,
    mouse: Position2D,
    range: number
  ) {
    const a =
      Math.abs(pathPoints.x - mouse.x) < range &&
      Math.abs(pathPoints.y - mouse.y) < range;
    const b =
      Math.abs(pathPoints.w - mouse.x) < range &&
      Math.abs(pathPoints.h - mouse.y) < range;
    if (a) return "a";
    else if (b) return "b";
    else return undefined;
  }
  private getRectangle(cornerA: Position2D, cornerB: Position2D) {
    const a = MathU.getTileCoordinatesFromPoint(
      { x: cornerA.x, y: cornerA.y },
      this.tileSize
    );
    const b = MathU.getTileCoordinatesFromPoint(
      { x: cornerB.x, y: cornerB.y },
      this.tileSize
    );
    return {
      pointA: { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y) },
      pointB: { x: Math.max(a.x, b.x), y: Math.max(a.y, b.y) },
    };
  }
  private outOfBound(structPoints: Box2D, mousePos: Position2D) {
    const a =
      this.mouseManifest.dragPoint === "a" &&
      mousePos.x <= structPoints.w &&
      mousePos.y <= structPoints.h;
    const b =
      this.mouseManifest.dragPoint === "b" &&
      mousePos.x >= structPoints.x &&
      mousePos.y >= structPoints.y;
    console.log(a, b);
    if (!a && !b) return true;
    return false;
  }
  private getTileIndex(tilePos: Position2D): number {
    return MathU.getTileIndex({
      point: tilePos,
      gridWidth: this.gridWidth,
      tileSize: this.tileSize,
    });
  }
  private getTileCoordinates(mousePos: Position2D) {
    return MathU.getTileCoordinatesFromPoint(mousePos, this.tileSize);
  }
  private calculateExportedIncludedTiles(struct: Structure) {
    const colliderTiles: Set<number> = new Set();
    let anchorTile = -1;
    const localCollider = {
      x: struct.colliderPoints.x - struct.pathPoints.x,
      y: struct.colliderPoints.y - struct.pathPoints.y,
      w: struct.colliderPoints.w - struct.pathPoints.x,
      h: struct.colliderPoints.h - struct.pathPoints.y,
    };

    const gridWidth = struct.objectTileSize.w;
    const tileColStart = Math.floor(localCollider.x / this.tileSize.w);
    const tileColEnd = Math.floor((localCollider.w - 1) / this.tileSize.w);
    const tileRowStart = Math.floor(localCollider.y / this.tileSize.h);
    const tileRowEnd = Math.floor((localCollider.h - 1) / this.tileSize.h);
    for (let row = tileRowStart; row <= tileRowEnd; row++) {
      for (let col = tileColStart; col <= tileColEnd; col++) {
        colliderTiles.add(row * gridWidth + col);
      }
    }
    const row = (struct.anchorPoints.x - struct.pathPoints.x) / this.tileSize.w;
    const col = (struct.anchorPoints.y - struct.pathPoints.y) / this.tileSize.h;
    anchorTile = col * struct.objectTileSize.w + row;
    return {
      colliderTiles: Array.from(colliderTiles),
      anchorTile: anchorTile,
    };
  }
  private getColor(type: keyof typeof COLORS, useAlpha: boolean = false) {
    const color = COLORS[type];
    if (useAlpha)
      return `rgba(${color[0]},${color[1]},${color[2]},${this.gridAlpha})`;
    else return `rgba(${color[0]},${color[1]},${color[2]},1)`;
  }
}
