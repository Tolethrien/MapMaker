import Vec2D from "@/math/vec2D";
import Camera from "../entitySystem/entities/camera";
import EntityManager from "../entitySystem/core/entityManager";
import Link from "@/utils/link";
import { Selectors } from "@/preload/globalLinks";
import GlobalStore from "./globalStore";
export type mouseEvents = (typeof MOUSE_EVENTS)[number];

export const MOUSE_EVENTS = ["leftClick", "rightClick", "scrollClick"] as const;
export interface MouseManifold {
  alt: boolean;
  shift: boolean;
  ctrl: boolean;
  left: boolean;
  right: boolean;
}

export default class InputManager {
  private static canvas: HTMLCanvasElement;
  private static newMouseManifold: MouseManifold = {
    alt: false,
    shift: false,
    ctrl: false,
    left: false,
    right: false,
  };
  private static currentMouseManifold: MouseManifold = {
    alt: false,
    shift: false,
    ctrl: false,
    left: false,
    right: false,
  };
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
    this.currentMouseManifold = this.newMouseManifold;
  }

  public static getMouseEvent() {
    return { event: this.newMouseManifold, position: this.mousePosition };
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
  private static mouseClickEvent(click: "up" | "down", e: MouseEvent) {
    if (click === "down") {
      this.newMouseManifold = {
        alt: e.altKey,
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        left: e.button === 0,
        right: e.button === 2,
      };
    } else {
      this.newMouseManifold = {
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
