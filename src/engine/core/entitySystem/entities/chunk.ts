import EventBus from "../../modules/eventBus/eventBus";
import GlobalStore from "../../modules/globalStore/globalStore";
import InputManager from "../../modules/inputManager/inputManager";
import Entity from "../core/entity";
import EntityManager, { ProjectConfig } from "../core/entityManager";
import Til from "./tile";
interface Props {
  index: number;
  position: Position2D;
}
export default class Chunk extends Entity {
  private tiles: Set<Til>;
  public index: number;
  public position: Position2D;
  private chunkSize: Size2D;
  constructor({ index, position }: Props) {
    super();
    this.tiles = new Set();
    this.index = index;
    this.position = position;
    this.chunkSize =
      GlobalStore.get<ProjectConfig>("projectConfig")[0].chunkSizeInPixels;
    EventBus.on("cameraMove", {
      name: `chunk-${this.index} move check`,
      callback: (event: Position2D) => {
        if (
          this.isCenterChunk(event) &&
          EntityManager.getCameraOnChunk !== this.index
        )
          EntityManager.remap(this.index, this.position);
      },
    });
  }
  public get getTiles() {
    return this.tiles;
  }
  public addTile(tile: Til) {
    this.tiles.add(tile);
  }
  update(): void {
    if (EntityManager.getFocusedChunk === this) console.log(this.index);
    this.tiles.forEach((tile) => tile.update());
  }
  render(): void {
    this.tiles.forEach((tile) => tile.render());
  }
  public isMouseCollide(mousePos: Position2D) {
    const normalizedMouse = InputManager.mouseToWorld(mousePos);
    return (
      normalizedMouse.x >= this.position.x &&
      normalizedMouse.x <= this.position.x + this.chunkSize.w &&
      normalizedMouse.y >= this.position.y &&
      normalizedMouse.y <= this.position.y + this.chunkSize.h
    );
  }
  private isCenterChunk(cameraPos: Position2D) {
    return (
      cameraPos.x > this.position.x &&
      cameraPos.x < this.position.x + this.chunkSize.w &&
      cameraPos.y > this.position.y &&
      cameraPos.y < this.position.y + this.chunkSize.h
    );
  }
}
