import Aurora from "@/engine/core/aurora/auroraCore";
import Mat4 from "@/math/mat4";
import EventBus from "@/utils/eventBus";
import Link from "@/utils/link";
import { Setter } from "solid-js";
import InputManager from "../../modules/inputManager";
import EntityManager from "../core/entityManager";
import MathU from "@/math/math";
import { Selectors } from "@/preload/globalLinks";
type CameraZoom = { current: number; max: number; min: number };

export default class Camera {
  private static view: Mat4;
  private static projectionViewMatrix: Mat4;
  private static position: Position2D;
  private static speed: number = 15;
  private static zoom: CameraZoom = { current: 1, max: 10, min: 0.1 };
  private static lastCameraOnChunk: number = 0;
  private static currentCameraOnChunk = 0;
  private static setUI: Setter<Position2D>;
  public static initialize(x: number, y: number) {
    this.projectionViewMatrix = Mat4.create();
    this.view = Mat4.create().lookAt([0, 0, 1], [0, 0, 0], [0, 1, 0]);
    this.position = { x: x / 2, y: y / 2 };
    this.setUI = Link.set<Position2D>("cameraPos");
    this.setUI(this.position);
  }
  public static get getCameraOnChunk() {
    return this.currentCameraOnChunk;
  }
  public static get getProjectionViewMatrix() {
    return this.projectionViewMatrix;
  }
  public static get getCameraPosition() {
    return { x: this.position.x, y: this.position.y };
  }
  private static async updateChunkView() {
    if (this.currentCameraOnChunk !== this.lastCameraOnChunk) {
      await EntityManager.frameCleanUp(this.currentCameraOnChunk);
      this.lastCameraOnChunk = this.currentCameraOnChunk;
    }
  }
  private static findCameraHover() {
    const camera = Camera.getCameraPosition;
    const chunks = EntityManager.getAllChunks().values();
    const hollows = EntityManager.getHollows().values();

    for (const chunk of chunks) {
      if (!MathU.pointCollide(camera, chunk.getBox)) continue;
      this.currentCameraOnChunk = chunk.index;
      return;
    }
    const gridMenu = Link.get<boolean>("gridMenu")();
    if (!gridMenu) return;
    for (const hollow of hollows) {
      if (!MathU.pointCollide(camera, hollow.getBox)) continue;
      this.currentCameraOnChunk = hollow.index;
      return;
    }
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
    this.findCameraHover();
    this.updateChunkView(); // no need to wait
  }

  private static cameraMove() {
    if (InputManager.noKeyEvent()) return;

    if (InputManager.onKeyHold("d")) this.position.x += this.speed;
    else if (InputManager.onKeyHold("a")) this.position.x -= this.speed;

    if (InputManager.onKeyHold("w")) this.position.y -= this.speed;
    else if (InputManager.onKeyHold("s")) this.position.y += this.speed;

    if (InputManager.onKeyHold("e"))
      this.zoom.current > this.zoom.min &&
        (this.zoom.current -= 0.01 * Math.log(this.zoom.current + 1));
    else if (InputManager.onKeyHold("q"))
      this.zoom.current < this.zoom.max &&
        (this.zoom.current += 0.01 * Math.log(this.zoom.current + 1));

    this.setUI(this.position);
  }
}
