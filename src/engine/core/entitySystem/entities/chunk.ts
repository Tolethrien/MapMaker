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
  private static SELECTION_COLOR = new Uint8ClampedArray([0, 0, 0]);
  private static SELECTION_TEXT_COLOR = new Uint8ClampedArray([255, 255, 255]);
  private tiles: Set<Tile>;
  public index: number;
  public gridPosition: Position2D;
  constructor({ index, position }: Props) {
    const size = Link.get<ProjectConfig>("projectConfig")().chunkSizeInPixels;
    super(
      {
        x: position.x + size.w * 0.5,
        y: position.y + size.h * 0.5,
      },
      { w: size.w * 0.5, h: size.h * 0.5 }
    );
    this.gridPosition = position;
    this.tiles = new Set();
    this.index = index;

    EventBus.on("cameraMove", {
      name: `chunk-${this.index} move check`,
      callback: (event: Position2D) => {
        if (this.isCameraCollide(event) && !this.isCameraOnChunk())
          EntityManager.remap(this.index, this.position.get);
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
        x: this.position.x + 100,
        y: this.position.y + 30,
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
      position: this.position.add([10, 10]).get,
      color: Chunk.SELECTION_TEXT_COLOR,
      fontFace: "roboto",
      fontSize: 40,
      text: `chunk: ${this.index}`,
    });
  }
  private drawUnselectedChunk() {
    Draw.Quad({
      alpha: 200,
      bloom: 0,
      crop: new Float32Array([0, 0, 1, 1]),
      isTexture: 0,
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      size: {
        w: this.size.x,
        h: this.size.y,
      },
      textureToUse: 0,
      tint: Chunk.SELECTION_TEXT_COLOR,
    });
    Draw.Text({
      alpha: 255,
      bloom: 0,
      position: this.position.add([10, 10]).get,
      color: Chunk.SELECTION_TEXT_COLOR,
      fontFace: "roboto",
      fontSize: 40,
      text: `chunk: ${this.index}`,
    });
  }
}
