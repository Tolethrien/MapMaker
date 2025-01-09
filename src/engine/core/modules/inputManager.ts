import Vec2D from "@/math/vec2D";
import Camera from "../entitySystem/entities/camera";
import EntityManager from "../entitySystem/core/entityManager";
import Link from "@/vault/link";
import { Selectors } from "@/API/links";
export type mouseEvents = (typeof MOUSE_EVENTS)[number];

export const MOUSE_EVENTS = ["leftClick", "rightClick", "scrollClick"] as const;
export interface MouseEventMod {
  x: number;
  y: number;
  alt: boolean;
  shift: boolean;
  ctrl: boolean;
}
export default class InputManager {
  private static canvas: HTMLCanvasElement;
  public static init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    canvas.addEventListener("click", (e) =>
      this.mouseClickEvent(e, "leftClick")
    );
    canvas.addEventListener("auxclick", (e) => {
      if (e.button === 2) this.mouseClickEvent(e, "rightClick");
      else if (e.button === 1) this.mouseClickEvent(e, "scrollClick");
    });
    window.addEventListener("keypress", () => {
      console.log("s");
    });
    window.addEventListener("keydown", (e) => {
      this.selectorEvents("down", e);
    });
    window.addEventListener("keyup", (e) => {
      this.selectorEvents("up", e);
    });
  }

  private static mouseClickEvent(e: MouseEvent, type: mouseEvents) {
    const mouseEventMod: MouseEventMod = {
      x: e.offsetX,
      y: e.offsetY,
      alt: e.altKey,
      shift: e.shiftKey,
      ctrl: e.ctrlKey,
    };
    const mousePos = { x: e.offsetX, y: e.offsetY };

    const chunks = EntityManager.getAllChunks();
    for (const [_, chunk] of chunks) {
      if (!chunk.isMouseCollide(mousePos)) continue;
      const selector = Link.get<Selectors>("activeSelector");
      if (selector() === "grid") {
        chunk.mouseEvent.onEvent[type]?.(mouseEventMod);
        break;
      }
      for (const tile of chunk.getTiles) {
        if (!tile.isMouseCollide(mousePos)) continue;
        tile.mouseEvent.onEvent[type]?.(mouseEventMod);
        break;
      }
      break;
    }
  }

  public static mouseToWorld({ x, y }: Position2D) {
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
  private static selectorEvents(key: "up" | "down", e: KeyboardEvent) {
    const setSelector = Link.set<Selectors>("activeSelector");

    if (key === "down") e.key === "Shift" && !e.repeat && setSelector("grid");
    else e.key === "Shift" && setSelector("tile");
  }
}
