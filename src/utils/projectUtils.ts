import EntityManager from "@/engine/core/entitySystem/core/entityManager";
import { ChunkTemplate } from "@/engine/core/entitySystem/entities/chunk";
import Engine from "@/engine/engine";
import { getAPI } from "@/preload/getAPI";
import Link from "@/utils/link";

const {
  createProjectBoilerplate,
  writeConfig,
  readConfig,
  readChunk,
  addTextureFile,
  deleteTextureFile,
} = getAPI("project");
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
    layersVisibility: [],
  };
  const boilerplate = await createProjectBoilerplate(projectPath);
  if (!boilerplate.success) return boilerplate;

  const configStatus = await writeConfig({
    config: projectConfig,
    projectPath,
  });
  if (!configStatus.success) return configStatus;

  await Engine.initialize(projectConfig);
  const createChunkStatus = await EntityManager.createEmptyChunk(0);
  if (!createChunkStatus.success) return createChunkStatus;
  const chunkIndexes = EntityManager.findChunksInRange({ x: 0, y: 0 });
  chunkIndexes.delete(0);
  EntityManager.generateHollows(chunkIndexes);

  return { error: "", success: true };
}

export async function openProject(folderPath: string): Promise<AsyncStatus> {
  const { data: config, error, success } = await readConfig(folderPath);
  if (!success) return { error, success };

  await Engine.initialize(config!);
  const hollows = new Set<number>();

  const chunks: ChunkTemplate[] = [];
  const chunkIndexes = EntityManager.findChunksInRange({ x: 0, y: 0 });
  for (const index of chunkIndexes) {
    const { data, success } = await readChunk({
      index,
      projectPath: folderPath,
    });
    if (!success) {
      hollows.add(index);
      continue;
    }
    chunks.push(data!);
  }

  chunks.forEach((chunk) => EntityManager.populateChunk(chunk));
  EntityManager.generateHollows(hollows);
  return { error: "", success: true };
}

export function closeProject() {
  Engine.closeEngine();
}

export async function addTexture(filePath: string, tileSize: Size2D) {
  const [getConfig, setConfig] = Link.getLink<ProjectConfig>("projectConfig");
  const config = getConfig();
  const { data, error, success } = await addTextureFile({
    filePath,
    projectPath: config.projectPath,
    tileSize: { w: tileSize.w, h: tileSize.h },
  });
  if (!success) return { error: `error to: ${error}`, success };
  setConfig(data!);
  return { error: "", success: true };
}
export async function deleteTexture(id: string) {
  const [getConfig, setConfig] = Link.getLink<ProjectConfig>("projectConfig");
  const config = getConfig();
  const { error, success, data } = await deleteTextureFile({
    fileID: id,
    projectPath: config.projectPath,
  });
  if (!success) return { error, success };
  setConfig(data!);
  return { error: "", success: true };
}
export async function writeVisibilityConfig() {
  const config = Link.get<ProjectConfig>("projectConfig")();
  config.layersVisibility = Array.from(EntityManager.getVisibilityList());
  const { error, success } = await writeConfig({
    config: config,
    projectPath: config.projectPath,
  });
  if (!success) return { error, success };
  return { error: "", success: true };
}
