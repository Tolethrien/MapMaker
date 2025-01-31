import EventBus from "@/utils/eventBus";
import Draw from "../../aurora/urp/draw";
import InputManager from "../../modules/inputManager";
import Entity from "../core/entity";
import EntityManager from "../core/entityManager";
import Tile, { TileTemplate } from "./tile";
import Link from "@/utils/link";
import { Selectors } from "@/preload/globalLinks";
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
  //TODO: pozbyc sie systemu addComponents
  private static SELECTION_COLOR = new Uint8ClampedArray([0, 0, 0]);
  private static SELECTION_TEXT_COLOR = new Uint8ClampedArray([255, 255, 255]);
  public transform: TypeOfComponent<"Transform">;
  public mouseEvent: TypeOfComponent<"MouseEvents">;

  private tiles: Set<Tile>;
  public index: number;
  constructor({ index, position }: Props) {
    super();
    this.tiles = new Set();
    this.index = index;
    const size = Link.get<ProjectConfig>("projectConfig")().chunkSizeInPixels;

    this.transform = this.addComponent("Transform", {
      position,
      size: { width: size.w, height: size.h },
    });

    EventBus.on("cameraMove", {
      name: `chunk-${this.index} move check`,
      callback: (event: Position2D) => {
        if (this.isCenterChunk(event) && !this.isCameraOnChunk())
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
    const isGrid = Link.get<Selectors>("activeSelector")() === "grid";
    if (isGrid) this.chunkSelector();
    else this.tiles.forEach((tile) => tile.update());
  }
  render(): void {
    this.tiles.forEach((tile) => tile.render());
    if (EntityManager.getFocusedChunkIndex === undefined) return;
    if (this.isChunkSelected()) this.drawSelectedChunk();
    else this.drawUnselectedChunk();
  }
  private chunkSelector() {
    if (!InputManager.onMouseClick("left")) return;
    if (this.isChunkSelected()) {
      EntityManager.setFocusedChunk(undefined);
      return;
    }
    if (this.isMouseCollide()) EntityManager.setFocusedChunk(this.index);
  }
  public isMouseCollide() {
    const mousePos = InputManager.getMousePosition();
    return (
      mousePos.x >= this.transform.position.x &&
      mousePos.x <= this.transform.position.x + this.transform.size.x &&
      mousePos.y >= this.transform.position.y &&
      mousePos.y <= this.transform.position.y + this.transform.size.y
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
  private isChunkSelected() {
    return EntityManager.getFocusedChunkIndex === this.index;
  }
  private isCameraOnChunk() {
    return EntityManager.getCameraOnChunk === this.index;
  }
  private drawSelectedChunk() {
    Draw.Quad({
      alpha: 200,
      bloom: 0,
      crop: new Float32Array([0, 0, 1, 1]),
      isTexture: 0,
      position: {
        x: this.transform.position.x + 100,
        y: this.transform.position.y + 30,
      },
      size: {
        w: 100,
        h: 30,
      },
      textureToUse: 0,
      tint: Chunk.SELECTION_COLOR,
    });
    Draw.Text({
      alpha: 255,
      bloom: 0,
      position: this.transform.position.add([10, 10]).get,
      color: Chunk.SELECTION_TEXT_COLOR,
      fontFace: "roboto",
      fontSize: 40,
      text: `chunk: ${this.index}`,
    });
  }
  private drawUnselectedChunk() {
    Draw.Quad({
      alpha: 100,
      bloom: 0,
      crop: new Float32Array([0, 0, 1, 1]),
      isTexture: 0,
      position: {
        x: this.transform.position.x + this.transform.size.x * 0.5,
        y: this.transform.position.y + this.transform.size.y * 0.5,
      },
      size: {
        w: this.transform.size.x * 0.5,
        h: this.transform.size.y * 0.5,
      },
      textureToUse: 0,
      tint: Chunk.SELECTION_COLOR,
    });
    Draw.Text({
      alpha: 255,
      bloom: 0,
      position: this.transform.position.add([10, 10]).get,
      color: Chunk.SELECTION_TEXT_COLOR,
      fontFace: "roboto",
      fontSize: 40,
      text: `chunk: ${this.index}`,
    });
  }
}
