import Engine from "@/engine/engine";
import Transform from "@/engine/sandbox/components/transform";
import AuroraCamera from "../../aurora/urp/auroraCamera";
import Mat4 from "@/math/mat4";
import Vec2D from "@/math/vec2D";
type pos2D = { x: number; y: number };
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
  //TODO: nie przeszukuj wszystkich encji, sprawdz wpierw na którym chunku jest myszka, i przeszukaj tylko te tile w nim
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
    Engine.getEntities().forEach((ent) => {
      const transform = ent.getComponent("Transform");
      const mouseEvent = ent.getComponent("MouseEvents");
      if (this.isMouseCollide(transform, { x: e.offsetX, y: e.offsetY })) {
        mouseEvent.onEvent[type]?.(mouseEventMod);
      }
    });
  }
  private static isMouseCollide(
    { position, size }: Transform,
    mousePos: pos2D
  ) {
    const normalizedMouse = this.mouseToWorld(
      mousePos,
      AuroraCamera.getProjectionViewMatrix
    );
    return (
      normalizedMouse.x >= position.get.x - size.get.x &&
      normalizedMouse.x <= position.get.x + size.get.x &&
      normalizedMouse.y >= position.get.y - size.get.y &&
      normalizedMouse.y <= position.get.y + size.get.y
    );
  }
  public static mouseToWorld({ x, y }: pos2D, camMatrix: Mat4) {
    const normalizedX = (x / this.canvas.width) * 2 - 1;
    const normalizedY = -(y / this.canvas.height) * 2 + 1;
    const inverseMatrix = camMatrix.invert();
    return Vec2D.create(
      inverseMatrix.transform([normalizedX, normalizedY, -1, 1]) as [
        number,
        number
      ]
    ).get;
  }
}
