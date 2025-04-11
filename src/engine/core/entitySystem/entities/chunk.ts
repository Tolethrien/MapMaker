import { MapMods } from "@/preload/globalLinks";
import Draw from "../../aurora/urp/draw";
import { LutType } from "../../modules/assetsManager";
import Entity from "../core/entity";
import EntityManager from "../core/entityManager";
import Tile from "./tile";
import Link from "@/utils/link";
import { getConfig } from "@/utils/utils";
interface Props {
  index: number;
  position: Position2D;
}

export default class Chunk extends Entity {
  private static GRID_COLOR = new Uint8ClampedArray([255, 255, 255]);
  private static SELECTION_COLOR = new Uint8ClampedArray([0, 0, 0]);
  private static SELECTION_TEXT_COLOR = new Uint8ClampedArray([255, 255, 255]);
  private tiles: Map<number, Tile>;
  public index: number;
  public gridPosition: Position2D;
  constructor({ index, position }: Props) {
    const size = getConfig().chunkSizeInPixels;
    super(
      {
        x: position.x,
        y: position.y,
      },
      { w: size.w, h: size.h }
    );
    this.gridPosition = position;
    this.tiles = new Map();
    this.index = index;
  }

  public get getTiles() {
    return this.tiles;
  }
  public get getBox() {
    return {
      x: this.position.x,
      y: this.position.y,
      w: this.size.x,
      h: this.size.y,
    };
  }
  public addTile(tile: Tile) {
    this.tiles.set(tile.index, tile);
  }
  onUpdate(): void {}

  onRender(type: LutType | "mods"): void {
    if (type === "tile") {
      const mapMods = Link.get<MapMods>("mapMods")();
      if (mapMods.grid) this.drawGrid();
      this.tiles.forEach((tile) => tile.onRender(type));
    } else if (type === "structure") {
      this.tiles.forEach((tile) => tile.onRender(type));
    }
    if (type === "mods") this.tiles.forEach((tile) => tile.drawCollider());

    // if (EntityManager.getFocusedChunkIndex === undefined) return;
    // if (this.isChunkSelected()) this.drawSelectedChunk();
    // else this.drawUnselectedChunk();
  }

  // private isChunkSelected() {
  //   return EntityManager.getFocusedChunkIndex === this.index;
  // }

  private drawSelectedChunk() {
    Draw.Text({
      alpha: 100,
      bloom: 0,
      position: this.position.add([80, 20]).get,
      color: Chunk.SELECTION_TEXT_COLOR,
      fontFace: "roboto",
      fontSize: 40,
      text: `chunk: ${this.index}`,
    });
  }
  private drawGrid() {
    const size = Draw.getTextureMeta();
    const config = getConfig();
    const crop = new Float32Array([
      0,
      0,
      config.chunkSizeInPixels.w / size.width,
      config.chunkSizeInPixels.h / size.height,
    ]);
    Draw.Quad({
      alpha: 100,
      bloom: 0,
      crop: crop,
      isTexture: 1,
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      size: {
        w: this.size.x,
        h: this.size.y,
      },
      textureToUse: 1,
      tint: Chunk.GRID_COLOR,
    });
  }
  private drawUnselectedChunk() {
    Draw.Quad({
      alpha: 100,
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
      tint: Chunk.SELECTION_COLOR,
    });

    Draw.Text({
      alpha: 255,
      bloom: 0,
      position: this.position.add([80, 20]).get,
      color: Chunk.SELECTION_TEXT_COLOR,
      fontFace: "roboto",
      fontSize: 40,
      text: `chunk: ${this.index}`,
    });
  }
}
