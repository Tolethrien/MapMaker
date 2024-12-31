import EntityManager, {
  ChunkPosition,
  ChunkTemplate,
  ProjectConfig,
} from "@/engine/core/entitySys/entityManager";
import GlobalStore from "@/engine/core/modules/globalStore/globalStore";
import Engine from "@/engine/engine";
import { getAPI } from "@/preload/getAPI";
import { joinPaths } from "@/utils/utils";

const { createFolder, createFile, readFile, editFile, readDir } =
  getAPI("API_FILE_SYSTEM");
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

  const canvas = document.getElementById("editorCanvas") as HTMLCanvasElement;
  await Engine.initialize(canvas, projectConfig);

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

  const canvas = document.getElementById("editorCanvas") as HTMLCanvasElement;
  await Engine.initialize(canvas, config);

  const chunks: { side: ChunkPosition; data: ChunkTemplate }[] = [];
  const chunkIndexes = EntityManager.findChunksInRange({ x: 0, y: 0 });
  for (const { index, side } of chunkIndexes) {
    const chunkDataStatus = await readFile({
      filePath: joinPaths(folderPath, "chunks", `chunk-${index}`),
      type: "json",
    });
    if (!chunkDataStatus.success) continue;
    const data = JSON.parse(chunkDataStatus.data as string) as ChunkTemplate;
    chunks.push({ data, side });
  }

  chunks.forEach((chunk) =>
    EntityManager.populateChunk(chunk.side, chunk.data)
  );

  return { error: "", success: true };
}
export async function saveChunk() {
  console.log("zapisuje...");
  // const [projectPath] = GlobalStore.get<string>("currentProjectPath");
  // const entityList = EntityManager.getEntitiesFromChunk("central") as Tile[];
  // const saveData: ChunkTemplate = {
  //   chunkIndex: 0,
  //   position: { x: 0, y: 0 },
  //   tiles: entityList.map((tile) => {
  //     return {
  //       index: tile.tileIndex,
  //       layers: [{ color: tile.color, zIndex: 0 }],
  //     };
  //   }),
  // };
  // const ChunkFileStatus = await createFile({
  //   data: JSON.stringify(saveData),
  //   dirPath: joinPaths(projectPath, "chunks"),
  //   fileName: "chunk-1",
  //   allowOverride: true,
  //   type: "json",
  // });
  // if (!ChunkFileStatus.success) return ChunkFileStatus;
  return { error: "", success: true };
}
export function closeProject() {
  Engine.closeEngine();
}
export async function createNewEmptyChunk(side: ChunkPosition) {
  const [projectPath] = GlobalStore.get<string>("currentProjectPath");
  const { data, position, chunkIndex } = EntityManager.createEmptyChunk(side, {
    x: 0,
    y: 0,
  });
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
