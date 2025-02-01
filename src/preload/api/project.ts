import EntityManager from "@/engine/core/entitySystem/core/entityManager";
import { ChunkTemplate } from "@/engine/core/entitySystem/entities/chunk";
import Engine from "@/engine/engine";
import { getAPI } from "@/preload/api/getAPI";

import { joinPaths } from "@/utils/utils";
import Link from "@/utils/link";
import { createNewEmptyChunk } from "./world";

const { createFolder, createFile, readFile, copyFile, deleteFile, fileExists } =
  getAPI("fileSystem");
const { createProjectBoilerplate, writeChunk, writeConfig } = getAPI("project");
const { joinPath } = getAPI("utils");
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
  const projectPath = await joinPath(props.dirPath, props.name);
  const projectConfig: ProjectConfig = {
    name: props.name,
    tileSize: { w: props.tileSize.w, h: props.tileSize.h },
    chunkSizeInTiles: { w: props.chunkSize.w, h: props.chunkSize.h },
    chunkSizeInPixels: {
      w: props.chunkSize.w * props.tileSize.w,
      h: props.chunkSize.h * props.tileSize.h,
    },
    projectPath: projectPath,
    textureUsed: [],
  };

  const boilerplate = await createProjectBoilerplate(projectPath);
  if (!boilerplate.success) return boilerplate;
  const configStatus = await writeConfig({
    config: projectConfig,
    projectPath,
  });
  if (!configStatus.success) return configStatus;

  await Engine.initialize(projectConfig);

  const createChunkStatus = await createNewEmptyChunk(0);
  const chunkIndexes = EntityManager.findChunksInRange({ x: 0, y: 0 });
  chunkIndexes.delete(0);
  EntityManager.generateHollows(Array.from(chunkIndexes));
  if (!createChunkStatus.success) return createChunkStatus;

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
  const hollows = new Set<number>();

  const chunks: ChunkTemplate[] = [];
  const chunkIndexes = EntityManager.findChunksInRange({ x: 0, y: 0 });
  for (const index of chunkIndexes) {
    const chunkDataStatus = await readFile({
      filePath: joinPaths(folderPath, "chunks", `chunk-${index}`),
      type: "json",
    });
    if (!chunkDataStatus.success) {
      hollows.add(index);
      continue;
    }
    const data = JSON.parse(chunkDataStatus.data as string) as ChunkTemplate;
    chunks.push(data);
  }

  chunks.forEach((chunk) => EntityManager.populateChunk(chunk));
  EntityManager.generateHollows(Array.from(hollows));
  return { error: "", success: true };
}

export function closeProject() {
  Engine.closeEngine();
}

export async function addTextureFile(
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

  config.textureUsed.push({
    name: fileName,
    path: newPath,
    tileSize,
    id: crypto.randomUUID(),
  });

  const newConfigFileStatus = await createFile({
    data: JSON.stringify(config),
    dirPath: config.projectPath,
    fileName: "config",
    type: "json",
    allowOverride: true,
  });
  if (!newConfigFileStatus.success) return newConfigFileStatus;
  setConfig(config);
  return { error: "", success: true };
}
export async function deleteTextureFile(id: string) {
  const [getConfig, setConfig] = Link.getLink<ProjectConfig>("projectConfig");
  const config = getConfig();
  const index = config.textureUsed.findIndex((texture) => texture.id === id);
  const path = config.textureUsed[index].path;
  const deleteStatus = await deleteFile(path);
  if (!deleteStatus.success) return deleteStatus;

  config.textureUsed.splice(index, 1);

  const newConfigFileStatus = await createFile({
    data: JSON.stringify(config),
    dirPath: config.projectPath,
    fileName: "config",
    type: "json",
    allowOverride: true,
  });
  if (!newConfigFileStatus.success) return newConfigFileStatus;
  setConfig(config);
  return { error: "", success: true };
}
