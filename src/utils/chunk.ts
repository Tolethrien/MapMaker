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
  //get tile position based on placeman in chunk grid
  const tilesPerRow = chunkSize.w;

  const spacing = 2; // odstęp w pikselach

  // Oblicz współrzędne kafelka w siatce chunku
  const tileXIndex = tileIndex % tilesPerRow; // Współrzędna X w siatce chunku
  const tileYIndex = Math.floor(tileIndex / tilesPerRow); // Współrzędna Y w siatce chunku

  // Oblicz globalną pozycję kafelka na podstawie pozycji chunku i wymiarów kafelka
  const tileX = chunkPos.x + tileXIndex * tileSize.w + tileXIndex * spacing;
  const tileY = chunkPos.y + tileYIndex * tileSize.h + tileYIndex * spacing;

  return { x: tileX, y: tileY };
}
