import Draw from "../../aurora/urp/draw";
import EventBus from "../../modules/eventBus/eventBus";
import GlobalStore from "../../modules/globalStore/globalStore";
import InputManager from "../../modules/inputManager/inputManager";
import Entity from "../core/entity";
import EntityManager, { ProjectConfig } from "../core/entityManager";
import Tile, { TileTemplate } from "./tile";
interface Props {
  index: number;
  position: Position2D;
}
export interface ChunkTemplate {
  position: Position2D;
  index: number;
  tiles: TileTemplate[];
}
export default class Chunk extends Entity {
  public transform: TypeOfComponent<"Transform">;
  private tiles: Set<Tile>;
  public index: number;
  constructor({ index, position }: Props) {
    super();
    this.tiles = new Set();
    this.index = index;
    const size =
      GlobalStore.get<ProjectConfig>("projectConfig")[0].chunkSizeInPixels;
    this.transform = this.addComponent("Transform", {
      position,
      size: { width: size.w, height: size.h },
    });
    EventBus.on("cameraMove", {
      name: `chunk-${this.index} move check`,
      callback: (event: Position2D) => {
        if (
          this.isCenterChunk(event) &&
          EntityManager.getCameraOnChunk !== this.index
        )
          EntityManager.remap(this.index, this.transform.position.get);
      },
    });
  }
  public get getTiles() {
    return this.tiles;
  }
  public addTile(tile: Tile) {
    this.tiles.add(tile);
  }
  update(): void {
    if (EntityManager.getFocusedChunk === this) console.log(this.index);
    this.tiles.forEach((tile) => tile.update());
  }
  render(): void {
    this.tiles.forEach((tile) => tile.render());
    Draw.Text({
      alpha: 255,
      bloom: 0,
      position: this.transform.position.get,
      color: new Uint8ClampedArray([0, 0, 0]),
      fontFace: "roboto",
      fontSize: 32,
      text: `chunk: ${this.index}`,
    });
  }
  public isMouseCollide(mousePos: Position2D) {
    const normalizedMouse = InputManager.mouseToWorld(mousePos);
    return (
      normalizedMouse.x >= this.transform.position.x &&
      normalizedMouse.x <= this.transform.position.x + this.transform.size.x &&
      normalizedMouse.y >= this.transform.position.y &&
      normalizedMouse.y <= this.transform.position.y + this.transform.size.y
    );
  }
  private isCenterChunk(cameraPos: Position2D) {
    return (
      cameraPos.x > this.transform.position.x &&
      cameraPos.x < this.transform.position.x + this.transform.size.x &&
      cameraPos.y > this.transform.position.y &&
      cameraPos.y < this.transform.position.y + this.transform.size.y
    );
  }
}
