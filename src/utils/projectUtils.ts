import EntityManager, {
  ExportedChunk,
  exportedTile,
} from "@/engine/core/entitySystem/core/entityManager";
import Engine from "@/engine/engine";
import { getAPI } from "@/preload/getAPI";
import MathU from "@/math/math";
import { getConfig } from "./utils";
import EngineDebugger from "@/engine/core/modules/debugger";

const {
  createProjectBoilerplate,
  writeConfig,
  readConfig,
  readChunk,
  writeChunk,
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
  const chunkIndexes = MathU.getChunksInRange(
    { x: 0, y: 0 },
    EntityManager.RINGS
  );
  chunkIndexes.delete(0);
  EntityManager.generateHollows(chunkIndexes);

  return { error: "", success: true };
}

export async function openProject(folderPath: string): Promise<AsyncStatus> {
  const { data: config, error, success } = await readConfig(folderPath);
  if (!success) return { error, success };

  await Engine.initialize(config!);
  const hollows = new Set<number>();

  const chunks: ExportedChunk[] = [];
  const chunkIndexes = MathU.getChunksInRange(
    { x: 0, y: 0 },
    EntityManager.RINGS
  );
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
export async function saveChunkOnChange(chunkIndex: number) {
  const config = getConfig();
  const chunk = EntityManager.getChunk(chunkIndex);
  EngineDebugger.assertValue(chunk, {
    msg: "Save on change got non existent index",
  });
  const tiles: exportedTile[] = [];
  chunk.getTiles.forEach((tile) =>
    tiles.push({
      collider: tile.collider,
      tileLayers: tile.tileLayers,
      structureLayers: tile.structureLayers,
    })
  );
  const saveData: ExportedChunk = {
    index: chunk.index,
    position: chunk.gridPosition,
    tiles: tiles,
  };
  const ChunkFileStatus = await writeChunk({
    chunk: saveData,
    projectPath: config.projectPath,
  });
  if (!ChunkFileStatus.success) return ChunkFileStatus;
  return { error: "", success: true };
}
