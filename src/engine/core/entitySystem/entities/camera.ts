import Aurora from "@/engine/core/aurora/auroraCore";
import Mat4 from "@/math/mat4";
import EventBus from "@/vault/eventBus";
import Link from "@/vault/link";
import { Setter } from "solid-js";
type CameraZoom = { current: number; max: number; min: number };
const cameraData = {
  keyPressed: new Set(),
};

export default class Camera {
  private static view: Mat4;
  private static projectionViewMatrix: Mat4;
  private static position: Position2D;
  private static speed: number;
  private static zoom: CameraZoom;
  private static setUI: Setter<Position2D>;
  public static initialize() {
    this.projectionViewMatrix = Mat4.create();
    this.view = Mat4.create().lookAt([0, 0, 1], [0, 0, 0], [0, 1, 0]);
    this.position = { x: Aurora.canvas.width / 2, y: Aurora.canvas.height / 2 };
    this.speed = 15;
    this.zoom = { current: 1, max: 10, min: 0.1 };
    this.setUI = Link.set<Position2D>("cameraPos");
    this.setUI(this.position);

    window.onkeydown = (event: KeyboardEvent) => {
      const pressedKey = event.key === " " ? "space" : event.key;
      !event.repeat && cameraData.keyPressed.add(pressedKey);
    };
    window.onkeyup = (event: KeyboardEvent) => {
      const pressedKey = event.key === " " ? "space" : event.key;
      cameraData.keyPressed.has(pressedKey) &&
        cameraData.keyPressed.delete(pressedKey);
    };
  }
  public static get getProjectionViewMatrix() {
    return this.projectionViewMatrix;
  }
  public static get getCameraPosition() {
    return { x: this.position.x, y: this.position.y };
  }
  public static update() {
    this.cameraMove();
    this.projectionViewMatrix = Mat4.create()
      .ortho(
        this.position.x * this.zoom.current - Aurora.canvas.width / 2,
        this.position.x * this.zoom.current + Aurora.canvas.width / 2,
        this.position.y * this.zoom.current + Aurora.canvas.height / 2,
        this.position.y * this.zoom.current - Aurora.canvas.height / 2,
        -1,
        1
      )
      .multiply(this.view)
      .scale(this.zoom.current);
  }

  private static cameraMove() {
    if (cameraData.keyPressed.size === 0) return;
    if (cameraData.keyPressed.has("d")) this.position.x += this.speed;
    else if (cameraData.keyPressed.has("a")) this.position.x -= this.speed;
    if (cameraData.keyPressed.has("w")) this.position.y -= this.speed;
    else if (cameraData.keyPressed.has("s")) this.position.y += this.speed;
    if (cameraData.keyPressed.has("ArrowDown"))
      this.zoom.current > this.zoom.min &&
        (this.zoom.current -= 0.01 * Math.log(this.zoom.current + 1));
    else if (cameraData.keyPressed.has("ArrowUp"))
      this.zoom.current < this.zoom.max &&
        (this.zoom.current += 0.01 * Math.log(this.zoom.current + 1));
    EventBus.emit<Position2D>("cameraMove", this.position);
    this.setUI(this.position);
  }
}
