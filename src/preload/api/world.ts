import EngineDebugger from "@/engine/core/modules/debugger";
import Link from "@/utils/link";
import { getAPI } from "@/preload/api/getAPI";

import { joinPaths } from "@/utils/utils";
import { ChunkTemplate } from "@/engine/core/entitySystem/entities/chunk";
import EntityManager, {
  ChunkPosition,
} from "@/engine/core/entitySystem/core/entityManager";
import { TileTemplate } from "@/engine/core/entitySystem/entities/tile";
const { createFile, readFile } = getAPI("fileSystem");

export async function loadChunks(chunks: Set<number>) {
  const config = Link.get<ProjectConfig>("projectConfig")();

  //TODO: change this to own threat and delegating jobs
  const chunkPromises = Array.from(chunks).map(async (index) => {
    const chunkDataStatus = await readFile({
      filePath: joinPaths(config.projectPath, "chunks", `chunk-${index}`),
      type: "json",
    });

    if (!chunkDataStatus.success) {
      chunks.delete(index);
      return null;
    }

    const data = JSON.parse(chunkDataStatus.data as string) as ChunkTemplate;
    return data;
  });
  const results = await Promise.all(chunkPromises);

  results
    .filter((data): data is ChunkTemplate => data !== null)
    .forEach((chunkData) => {
      EntityManager.populateChunk(chunkData);
      chunks.delete(chunkData.index);
    });
}
export async function createNewEmptyChunk(
  side: ChunkPosition,
  pos: Position2D
) {
  const config = Link.get<ProjectConfig>("projectConfig")();

  const { data, position, chunkIndex } = EntityManager.createEmptyChunk(
    side,
    pos
  );
  const saveData: ChunkTemplate = {
    index: chunkIndex,
    position: { x: position.x, y: position.y },
    tiles: data.map((tile) => {
      return {
        collider: 0,
        index: tile.tileIndex,
        layers: [],
      };
    }),
  };
  const ChunkFileStatus = await createFile({
    data: JSON.stringify(saveData),
    dirPath: joinPaths(config.projectPath, "chunks"),
    fileName: `chunk-${chunkIndex}`,
    allowOverride: false,
    type: "json",
  });
  if (!ChunkFileStatus.success) return ChunkFileStatus;
  return { error: "", success: true };
}

export async function saveOnChange(chunkIndex: number) {
  const config = Link.get<ProjectConfig>("projectConfig")();
  const chunk = EntityManager.getChunk(chunkIndex);
  EngineDebugger.assertValue(chunk, {
    msg: "Save on change got non existent index",
  });
  const tiles: TileTemplate[] = [];
  chunk.getTiles.forEach((tile) =>
    tiles.push({
      collider: 0,
      index: tile.tileIndex,
      layers: tile.layers,
    })
  );
  const saveData: ChunkTemplate = {
    index: chunk.index,
    position: chunk.transform.position.get,
    tiles: tiles,
  };
  const ChunkFileStatus = await createFile({
    data: JSON.stringify(saveData),
    dirPath: joinPaths(config.projectPath, "chunks"),
    fileName: `chunk-${chunkIndex}`,
    allowOverride: true,
    type: "json",
  });
  if (!ChunkFileStatus.success) return ChunkFileStatus;
  return { error: "", success: true };
}
