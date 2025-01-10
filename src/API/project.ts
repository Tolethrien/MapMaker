import EntityManager, {
  ChunkPosition,
  ProjectConfig,
} from "@/engine/core/entitySystem/core/entityManager";
import { ChunkTemplate } from "@/engine/core/entitySystem/entities/chunk";
import { TileTemplate } from "@/engine/core/entitySystem/entities/tile";
import EngineDebugger from "@/engine/core/modules/debugger";
import GlobalStore from "@/engine/core/modules/globalStore";
import Engine from "@/engine/engine";
import { getAPI } from "@/preload/getAPI";
import { joinPaths } from "@/utils/utils";
import Link from "@/vault/link";

const { createFolder, createFile, readFile } = getAPI("API_FILE_SYSTEM");
export interface NewProjectProps {
  dirPath: string;
  name: string;
  defaultPath: string;
  tileSize: { w: number; h: number };
  chunkSize: { w: number; h: number };
}

export async function createNewProject(
  props: NewProjectProps
): Promise<AsyncStatus> {
  if (props.dirPath.length === 0)
    return { error: "Error: dirPath length is 0", success: false };
  const folderPath = joinPaths(props.dirPath, props.name);

  const projectStatus = await createFolder(folderPath);
  if (!projectStatus.success) return projectStatus;

  const chunksStatus = await createFolder(joinPaths(folderPath, "chunks"));
  if (!chunksStatus.success) return chunksStatus;

  const textureFolderStatus = await createFolder(
    joinPaths(folderPath, "textures")
  );
  if (!textureFolderStatus.success) return textureFolderStatus;

  const projectConfig: ProjectConfig = {
    name: props.name,
    tileSize: props.tileSize,
    chunkSizeInTiles: props.chunkSize,
    chunkSizeInPixels: {
      w: props.chunkSize.w * props.tileSize.w,
      h: props.chunkSize.h * props.tileSize.h,
    },
    projectPath: props.dirPath,
  };
  const configFileStatus = await createFile({
    data: JSON.stringify(projectConfig),
    dirPath: folderPath,
    fileName: "config",
    type: "json",
    allowOverride: false,
  });
  if (!configFileStatus.success) return configFileStatus;

  await Engine.initialize(projectConfig);

  const { chunkIndex, data, position } = EntityManager.createEmptyChunk(
    "central",
    { x: 0, y: 0 }
  );
  const chunk: ChunkTemplate = {
    index: chunkIndex,
    position: position,
    tiles: data.map((tile) => {
      return {
        collider: 0,
        index: tile.tileIndex,
        layers: [{ color: tile.color, zIndex: 0, graphicID: 0 }],
      };
    }),
  };
  const ChunkFileStatus = await createFile({
    data: JSON.stringify(chunk),
    dirPath: joinPaths(folderPath, "chunks"),
    fileName: `chunk-${chunkIndex}`,
    allowOverride: false,
    type: "json",
  });
  if (!ChunkFileStatus.success) return ChunkFileStatus;

  return { error: "", success: true };
}

export async function openProject(folderPath: string): Promise<AsyncStatus> {
  const projectConfigStatus = await readFile({
    filePath: joinPaths(folderPath, "config"),
    type: "json",
  });
  if (!projectConfigStatus.success) return projectConfigStatus;

  const config = JSON.parse(
    projectConfigStatus.data as string
  ) as ProjectConfig;

  await Engine.initialize(config);

  const chunks: ChunkTemplate[] = [];
  const chunkIndexes = EntityManager.findChunksInRange({ x: 0, y: 0 });
  for (const index of chunkIndexes) {
    const chunkDataStatus = await readFile({
      filePath: joinPaths(folderPath, "chunks", `chunk-${index}`),
      type: "json",
    });
    if (!chunkDataStatus.success) continue;
    const data = JSON.parse(chunkDataStatus.data as string) as ChunkTemplate;
    chunks.push(data);
  }

  chunks.forEach((chunk) => EntityManager.populateChunk(chunk));

  return { error: "", success: true };
}
export async function loadChunks(chunks: Set<number>) {
  const rand = Math.random().toFixed(3);
  EngineDebugger.startTimer(`${rand}:chunk loading...`);

  const config = Link.get<ProjectConfig>("projectConfig")();

  //TODO: change this to own threat and delegating jobs
  const chunkPromises = Array.from(chunks).map(async (index) => {
    const chunkDataStatus = await readFile({
      filePath: joinPaths(
        config.projectPath,
        config.name,
        "chunks",
        `chunk-${index}`
      ),
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
  EngineDebugger.endTimer(`${rand}:chunk loading...`);
}
export async function saveOnChange(chunkIndex: number) {
  console.log("zapisuje...");
  const [projectPath] = GlobalStore.get<string>("currentProjectPath");
  const chunk = EntityManager.getChunk(chunkIndex);
  EngineDebugger.assertValue(chunk, {
    msg: "Save on change got non existent index",
  });
  const tiles: TileTemplate[] = [];
  chunk.getTiles.forEach((tile) =>
    tiles.push({
      collider: 0,
      index: tile.tileIndex,
      layers: [{ zIndex: 0, color: tile.color, graphicID: 0 }],
    })
  );
  const saveData: ChunkTemplate = {
    index: chunk.index,
    position: chunk.transform.position.get,
    tiles: tiles,
  };
  const ChunkFileStatus = await createFile({
    data: JSON.stringify(saveData),
    dirPath: joinPaths(projectPath, "chunks"),
    fileName: `chunk-${chunkIndex}`,
    allowOverride: true,
    type: "json",
  });
  if (!ChunkFileStatus.success) return ChunkFileStatus;
  return { error: "", success: true };
}
export function closeProject() {
  Engine.closeEngine();
}
export async function createNewEmptyChunk(
  side: ChunkPosition,
  pos: Position2D
) {
  const [projectPath] = GlobalStore.get<string>("currentProjectPath");
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
        layers: [{ color: tile.color, zIndex: 0, graphicID: 0 }],
      };
    }),
  };
  const ChunkFileStatus = await createFile({
    data: JSON.stringify(saveData),
    dirPath: joinPaths(projectPath, "chunks"),
    fileName: `chunk-${chunkIndex}`,
    allowOverride: false,
    type: "json",
  });
  if (!ChunkFileStatus.success) return ChunkFileStatus;
  return { error: "", success: true };
}
