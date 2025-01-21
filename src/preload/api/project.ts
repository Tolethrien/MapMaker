import EntityManager from "@/engine/core/entitySystem/core/entityManager";
import { ChunkTemplate } from "@/engine/core/entitySystem/entities/chunk";
import Engine from "@/engine/engine";
import { getAPI } from "@/preload/api/getAPI";

import { joinPaths } from "@/utils/utils";
import Link from "@/utils/link";

const { createFolder, createFile, readFile, copyFile } =
  getAPI("API_FILE_SYSTEM");
const { openFilePicker } = getAPI("API_DIALOG");
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
    tileSize: { w: props.tileSize.w, h: props.tileSize.h },
    chunkSizeInTiles: { w: props.chunkSize.w, h: props.chunkSize.h },
    chunkSizeInPixels: {
      w: props.chunkSize.w * props.tileSize.w,
      h: props.chunkSize.h * props.tileSize.h,
    },
    projectPath: joinPaths(props.dirPath, props.name),
    textureUsed: [],
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

export function closeProject() {
  Engine.closeEngine();
}

export async function saveTexture(
  filePath: string,
  file: string,
  fileName: string,
  tileSize: Size2D
) {
  const [getConfig, setConfig] = Link.getLink<ProjectConfig>("projectConfig");
  const config = getConfig();
  const newPath = joinPaths(config.projectPath, "textures", file);

  const copyStatus = await copyFile(filePath, newPath);
  if (!copyStatus.success) return copyStatus;

  config.textureUsed.push({ name: fileName, path: newPath, tileSize });
  setConfig(config);

  const newConfigFileStatus = await createFile({
    data: JSON.stringify(config),
    dirPath: config.projectPath,
    fileName: "config",
    type: "json",
    allowOverride: true,
  });
  if (!newConfigFileStatus.success) return newConfigFileStatus;
  return { error: "", success: true };
}
