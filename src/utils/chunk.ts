interface GetTilePops {
  chunkPos: { x: number; y: number };
  chunkSize: { w: number; h: number };
  tileSize: { w: number; h: number };

  tileIndex: number;
}
export function getTilePosition({
  chunkPos,
  chunkSize,
  tileIndex,
  tileSize,
}: GetTilePops) {
  const tilesPerRow = chunkSize.w;
  const spacing = 2;
  const tileXIndex = tileIndex % tilesPerRow;
  const tileYIndex = Math.floor(tileIndex / tilesPerRow);
  const tileX = chunkPos.x + tileXIndex * tileSize.w + tileXIndex * spacing;
  const tileY = chunkPos.y + tileYIndex * tileSize.h + tileYIndex * spacing;

  return { x: tileX, y: tileY };
}
