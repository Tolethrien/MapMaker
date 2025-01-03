import Vec2D from "@/math/vec2D";
import Camera from "../../entitySystem/entities/camera";
import EntityManager from "../../entitySystem/core/entityManager";
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
    for (const [index, chunk] of chunks) {
      if (!chunk.isMouseCollide(mousePos)) continue;

      if (mouseEventMod.shift) {
        EntityManager.setFocusedChunk(index);
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
}
