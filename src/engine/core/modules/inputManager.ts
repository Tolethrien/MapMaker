import Vec2D from "@/math/vec2D";
import Camera from "../entitySystem/entities/camera";
import Link from "@/utils/link";
import Aurora from "../aurora/auroraCore";
import { getConfig } from "@/utils/utils";
import EntityManager from "../entitySystem/core/entityManager";
import MathU from "@/math/math";
import GlobalStore from "./globalStore";

export type MouseManifold = typeof MOUSE_STATE;
const MOUSE_STATE = {
  alt: false,
  shift: false,
  ctrl: false,
  left: false,
  right: false,
};

export default class InputManager {
  private static canvas: HTMLCanvasElement;
  private static internalState: MouseManifold = { ...MOUSE_STATE };
  private static prevMouseState: MouseManifold = { ...MOUSE_STATE };
  private static currMouseState: MouseManifold = { ...MOUSE_STATE };
  private static keyCurrent = new Set<string>();
  private static keyLast = new Set<string>();
  private static internalKeys = new Set<string>();
  private static mousePosition: Position2D = { x: 0, y: 0 };
  private static currentMouseHover = { chunk: -1, tile: -1 };

  public static init() {
    const [canvas] = GlobalStore.get<HTMLCanvasElement>("globalCanvas");
    this.canvas = canvas;
    this.canvas.addEventListener("mousedown", (e) =>
      this.mouseClickEvent("down", e)
    );
    this.canvas.addEventListener("mouseup", (e) =>
      this.mouseClickEvent("up", e)
    );
    this.canvas.addEventListener("mousemove", (e) => this.mouseMoveEvent(e));
    window.addEventListener("keydown", (e) => this.internalKeys.add(e.key));
    window.addEventListener("keyup", (e) => {
      this.internalKeys.delete(e.key);
    });
  }
  public static get getMouseHover() {
    return this.currentMouseHover;
  }
  public static update() {
    this.prevMouseState = this.currMouseState;
    this.currMouseState = this.internalState;
    this.keyLast = new Set(this.keyCurrent.values());
    this.keyCurrent = new Set(this.internalKeys.values());
    this.bakedKeyboardEvents();
    this.mouseWorldHover(this.getMousePosition());
    // this.bakedMouseEvents();
  }

  public static onKeyClick(key: KeyboardEvent["key"]) {
    return !this.keyLast.has(key) && this.keyCurrent.has(key);
  }
  public static onKeyHold(key: KeyboardEvent["key"]) {
    return this.keyCurrent.has(key);
  }
  public static onKeyRelease(key: KeyboardEvent["key"]) {
    return !this.keyCurrent.has(key) && this.keyLast.has(key);
  }
  public static noKeyEvent() {
    return this.keyCurrent.size === 0 && this.keyLast.size === 0;
  }
  public static onMouseClick(key: "left" | "right") {
    if (key === "left" && this.currMouseState.left && !this.prevMouseState.left)
      return true;
    else if (
      key === "right" &&
      this.currMouseState.right &&
      !this.prevMouseState.right
    )
      return true;
    return false;
  }
  public static onMouseDown(key: "left" | "right") {
    if (key === "left" && this.currMouseState.left) return true;
    else if (key === "right" && this.currMouseState.right) return true;
    return false;
  }
  public static onMouseUp(key: "left" | "right") {
    if (key === "left" && this.prevMouseState.left && !this.currMouseState.left)
      return true;
    else if (
      key === "right" &&
      this.prevMouseState.left &&
      !this.currMouseState.right
    )
      return true;
    return false;
  }
  public static getMousePosition() {
    return this.mousePosition;
  }
  public static bakedKeyboardEvents() {
    if (this.onKeyHold("Alt") && this.onKeyClick("1")) changeSelector("grid");
    if (this.onKeyHold("Alt") && this.onKeyClick("2")) changeSelector("tile");
    if (this.onKeyHold("Alt") && this.onKeyClick("3")) changeSelector("layer");
    if (this.onKeyClick("c")) this.controlZIndex("up");
    if (this.onKeyClick("z")) this.controlZIndex("down");
  }

  private static controlZIndex(index: "up" | "down") {
    const [getter, setter] = Link.getLink<number>("z-index");
    if (index === "up") setter((prev) => prev + 1);
    if (index === "down") getter() > 0 && setter((prev) => prev - 1);
  }
  private static mouseWorldHover(mouse: Position2D) {
    const { chunkSizeInTiles, tileSize } = getConfig();
    const chunks = EntityManager.getAllChunks().values();
    for (const chunk of chunks) {
      if (!MathU.pointCollide(mouse, chunk.getBox)) continue;
      const tile =
        Math.floor((mouse.y - chunk.position.y) / tileSize.h) *
          chunkSizeInTiles.h +
        Math.floor((mouse.x - chunk.position.x) / tileSize.w);
      this.currentMouseHover = { chunk: chunk.index, tile };
      return;
    }
    this.currentMouseHover = { chunk: -1, tile: -1 };
  }

  private static mouseToWorld({ x, y }: Position2D) {
    const normalizedX = (x / this.canvas.width) * 2 - 1;
    const normalizedY = -(y / this.canvas.height) * 2 + 1;
    const inverseMatrix = Camera.getProjectionViewMatrix.invert();
    return Vec2D.create(
      inverseMatrix.transform([normalizedX, normalizedY, -1, 1]) as [
        number,
        number
      ]
    ).get;
  }
  public worldToCanvas({ x, y }: Position2D): Position2D {
    const worldPoint = [x, y, 0, 1];

    const projectedPoint = Camera.getProjectionViewMatrix.transform(worldPoint);

    const normalizedX = projectedPoint[0] / projectedPoint[3];
    const normalizedY = projectedPoint[1] / projectedPoint[3];

    const canvasX = ((normalizedX + 1) / 2) * Aurora.canvas.width;
    const canvasY = ((1 - normalizedY) / 2) * Aurora.canvas.height;
    return { x: canvasX, y: canvasY };
  }
  private static mouseClickEvent(click: "up" | "down", e: MouseEvent) {
    if (click === "down") {
      this.internalState = {
        alt: e.altKey,
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        left: e.button === 0,
        right: e.button === 2,
      };
    } else {
      this.internalState = {
        alt: false,
        ctrl: false,
        shift: false,
        left: false,
        right: false,
      };
    }
  }
  private static mouseMoveEvent(e: MouseEvent) {
    const { x, y } = this.mouseToWorld({ x: e.offsetX, y: e.offsetY });
    this.mousePosition = { x: x, y: y };
  }
}
