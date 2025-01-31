import Vec2D from "@/math/vec2D";
import Camera from "../entitySystem/entities/camera";
import Link from "@/utils/link";
import { Selectors } from "@/preload/globalLinks";
import GlobalStore from "./globalStore";
import Aurora from "../aurora/auroraCore";
export type mouseEvents = (typeof MOUSE_EVENTS)[number];

export const MOUSE_EVENTS = ["leftClick", "rightClick", "scrollClick"] as const;
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

  private static mousePosition: Position2D = { x: 0, y: 0 };
  public static init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvas.addEventListener("mousedown", (e) =>
      this.mouseClickEvent("down", e)
    );
    this.canvas.addEventListener("mouseup", (e) =>
      this.mouseClickEvent("up", e)
    );
    this.canvas.addEventListener("mousemove", (e) => this.mouseMoveEvent(e));
  }
  public static update() {
    this.prevMouseState = this.currMouseState;
    this.currMouseState = this.internalState;
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
  private static selectorEvents(key: "up" | "down", e: KeyboardEvent) {
    const setSelector = Link.set<Selectors>("activeSelector");

    if (key === "down") e.key === "Shift" && !e.repeat && setSelector("grid");
    else e.key === "Shift" && setSelector("tile");
  }
}
