import Entity from "@/engine/core/entitySys/entity";
import { ProjectConfig } from "@/engine/core/entitySys/entityManager";
import GlobalStore from "@/engine/core/modules/globalStore/globalStore";
import InputManager from "@/engine/core/modules/inputManager/inputManager";

export default class Chunk {
  private tilesIDs: Set<Entity["id"]>;
  public index: number;
  public position: Position2D;
  public spiralPosition: number;
  public isActive: boolean;
  constructor(spiralIndex: number) {
    this.tilesIDs = new Set();
    this.index = undefined;
    this.position = undefined;
    this.spiralPosition = spiralIndex;
    this.isActive = false;
  }

  public get getTiles() {
    return this.tilesIDs;
  }
  public clear() {
    this.tilesIDs = new Set();
    this.index = undefined;
    this.position = undefined;
    this.isActive = false;
  }
  public get getMeta() {
    return {
      index: this.index,
      position: this.position,
      active: this.isActive,
    };
  }
  public setMeta({
    index,
    position,
    active,
  }: {
    index: Chunk["index"];
    position: Chunk["position"];
    active: Chunk["isActive"];
  }) {
    this.index = index;
    this.position = position;
    this.isActive = active;
  }
  public overrideTiles(tiles: Chunk["tilesIDs"]) {
    this.tilesIDs = tiles;
  }
  public isMouseCollide(mousePos: Position2D) {
    const chunkSizeInPixels =
      GlobalStore.get<ProjectConfig>("projectConfig")[0].chunkSizeInPixels;
    const normalizedMouse = InputManager.mouseToWorld(mousePos);
    return (
      normalizedMouse.x >= this.position.x &&
      normalizedMouse.x <= this.position.x + chunkSizeInPixels.w &&
      normalizedMouse.y >= this.position.y &&
      normalizedMouse.y <= this.position.y + chunkSizeInPixels.h
    );
  }
}
