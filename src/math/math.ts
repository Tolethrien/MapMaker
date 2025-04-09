import Chunk from "@/engine/core/entitySystem/entities/chunk";
import EngineDebugger from "@/engine/core/modules/debugger";
import { getConfig } from "@/utils/utils";
type GetTileIndex = {
  point: Position2D;
  tileSize: Size2D;
  gridWidth: number;
};
type GetTilePos = {
  index: number;
  tileSize: Size2D;
  gridWidth: number;
  offset?: Position2D;
};
export default class MathU {
  public static mapRange(
    value: number,
    inputMin: number,
    inputMax: number,
    outputMin: number,
    outputMax: number
  ) {
    return (
      outputMin +
      ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin)
    );
  }

  public static clamp(value: number, min: number, max: number) {
    if (min === max) return min;
    else if (min > max) throw new Error("min is greater then max");
    else if (value <= min) return min;
    else if (value >= max) return max;
    return value;
  }

  public static equalFloatErrorCheck(valueA: number, valueB: number) {
    return Math.abs(valueA - valueB) < 0.0005;
  }

  public static normalizeColor(color: number[]) {
    return color.map((value) => value / 255);
  }

  public static randomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  public static pointCollide(point: Position2D, box: Box2D) {
    return (
      point.x > box.x &&
      point.x < box.x + box.w &&
      point.y > box.y &&
      point.y < box.y + box.h
    );
  }
  // public static boxContain() {}
  // public static boxIntersect() {}

  public static getSpiralIndexFromPosition(position: Position2D): number {
    const config = getConfig();

    const x = Math.floor(position.x / config.chunkSizeInPixels.w);
    const y = Math.floor(position.y / config.chunkSizeInPixels.h);

    if (x === 0 && y === 0) return 0;

    const ring = Math.max(Math.abs(x), Math.abs(y));
    const ringStart = (2 * (ring - 1) + 1) ** 2;

    if (y === -ring) return ringStart + (6 * ring - 1) + Math.abs(x + ring);
    if (x === ring) return ringStart - 1 + Math.abs(y + ring);
    if (x === -ring) return ringStart + (4 * ring - 1) + Math.abs(y - ring);
    if (y === ring) return ringStart + (2 * ring - 1) + Math.abs(x - ring);
    throw EngineDebugger.programBreak(
      `Spiral Index in entity manager not found, this should be impossible`
    );
  }
  public static getSpiralPositionFromIndex(index: number): Position2D {
    if (index === 0) return { x: 0, y: 0 };
    const config = getConfig();
    const x = config.chunkSizeInPixels.w;
    const y = config.chunkSizeInPixels.h;

    const ring = Math.ceil((Math.sqrt(index + 1) - 1) / 2);
    const startIndex = (2 * ring - 1) ** 2;
    const offset = index - startIndex;

    const side = Math.floor(offset / (ring * 2));
    const position = offset % (ring * 2);

    switch (side) {
      case 0:
        return { x: ring * x, y: (-ring + 1 + position) * y };
      case 1:
        return { x: (ring - 1 - position) * x, y: ring * y };
      case 2:
        return { x: -ring * x, y: (ring - 1 - position) * y };
      case 3:
        return { x: (-ring + 1 + position) * x, y: -ring * y };
    }
    throw EngineDebugger.programBreak(
      `Position from Spiral Index in entity manager not found, this should be impossible`
    );
  }
  public static getChunksInRange(position: Position2D, rings: number) {
    const config = getConfig();
    const w = config.chunkSizeInPixels.w;
    const h = config.chunkSizeInPixels.h;
    const chunks: Set<number> = new Set();

    for (let dy = -rings; dy <= rings; dy++) {
      for (let dx = -rings; dx <= rings; dx++) {
        const index = MathU.getSpiralIndexFromPosition({
          x: position.x + dx * w,
          y: position.y + dy * h,
        });
        chunks.add(index);
      }
    }
    return chunks;
  }
  public static getLastRingIndexes(chunks: Map<number, Chunk>) {
    const lastIndex = Array.from(chunks.keys()).reduce((maxIndex, currIndex) =>
      currIndex > maxIndex ? currIndex : maxIndex
    );
    const chunkPosition = chunks.get(lastIndex)!.position;

    const config = getConfig();

    const x = Math.floor(chunkPosition.x / config.chunkSizeInPixels.w);
    const y = Math.floor(chunkPosition.y / config.chunkSizeInPixels.h);

    if (x === 0 && y === 0) return [1, 2, 3, 4, 5, 6, 7, 8];

    const ring = Math.max(Math.abs(x), Math.abs(y));
    const ringStartIndex = (2 * (ring - 1) + 1) ** 2;
    const numberOfIndexes = lastIndex - ringStartIndex;
    return Array.from(
      { length: numberOfIndexes },
      (_, index) => ringStartIndex + index
    );
  }
  public static getTileIndex({
    gridWidth,
    point,
    tileSize,
  }: GetTileIndex): number {
    const row = Math.floor(point.y / tileSize.h);
    const col = Math.floor(point.x / tileSize.w);
    return row * gridWidth + col;
  }
  public static getTileIndexFromPoint({
    gridWidth,
    point,
    tileSize,
  }: GetTileIndex) {
    const pos = this.getTileCoordinatesFromPoint(point, tileSize);
    return this.getTileIndex({ gridWidth, point: pos, tileSize });
  }
  public static getTileCoordinatesFromPoint(
    point: Position2D,
    tileSize: Size2D
  ) {
    const x = Math.floor(point.x / tileSize.w) * tileSize.w;
    const y = Math.floor(point.y / tileSize.h) * tileSize.h;
    return { x, y };
  }
  public static getTileCoordinatesFromIndex({
    gridWidth,
    index,
    tileSize,
    offset = { x: 0, y: 0 },
  }: GetTilePos) {
    const { tileCol, tileRow } = this.getTilePosInGrid(index, gridWidth);
    return {
      x: offset.x + tileCol * tileSize.w,
      y: offset.y + tileRow * tileSize.h,
    };
  }
  public static getTilePosInGrid(index: number, gridWidth: number) {
    const tileCol = index % gridWidth;
    const tileRow = Math.floor(index / gridWidth);
    return { tileCol, tileRow };
  }

  public static getTilesInBox(
    box: Box2D,
    gridWidth: number,
    tileSize: Size2D
  ): number[] {
    const tiles = [];

    const startIndex = this.getTileIndex({ gridWidth, tileSize, point: box });
    const endIndex = this.getTileIndex({
      gridWidth,
      tileSize,
      point: { x: box.w, y: box.h },
    });

    const startX = Math.min(startIndex % gridWidth, endIndex % gridWidth);
    const endX = Math.max(startIndex % gridWidth, endIndex % gridWidth);
    const startY = Math.min(
      Math.floor(startIndex / gridWidth),
      Math.floor(endIndex / gridWidth)
    );
    const endY = Math.max(
      Math.floor(startIndex / gridWidth),
      Math.floor(endIndex / gridWidth)
    );

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        tiles.push(y * gridWidth + x);
      }
    }
    return tiles;
  }
}
