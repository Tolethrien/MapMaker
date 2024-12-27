import GlobalStore from "@/engine/core/modules/globalStore/globalStore";
import Engine from "@/engine/engine";
import Tile from "@/engine/sandbox/entities/tile";
import { getAPI } from "@/preload/getAPI";
import { getTilePosition } from "@/utils/chunk";
import { joinPaths } from "@/utils/utils";

const { createFolder, createFile, readFile, editFile } =
  getAPI("API_FILE_SYSTEM");
export interface NewProjectProps {
  dirPath: string;
  name: string;
  defaultPath: string;
  tileSize: { w: number; h: number };
  chunkSize: { w: number; h: number };
  autosave: boolean;
}
interface ProjectConfig {
  projectPath: string;
  name: string;
  tileSize: { w: number; h: number };
  chunkSize: { w: number; h: number };
  autosave: boolean;
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
  const size = props.chunkSize.w * props.chunkSize.h * 3;
  const data: number[] = Array(size).fill(0);
  const ChunkFileStatus = await createFile({
    data: data,
    dirPath: joinPaths(folderPath, "chunks"),
    fileName: "chunk-1",
    allowOverride: false,
    type: "bin",
    typed: "Uint8Array",
  });
  if (!ChunkFileStatus.success) return ChunkFileStatus;

  const projectConfig: ProjectConfig = {
    name: props.name,
    tileSize: props.tileSize,
    chunkSize: props.chunkSize,
    projectPath: props.dirPath,
    autosave: props.autosave,
  };
  const configFileStatus = await createFile({
    data: JSON.stringify(projectConfig),
    dirPath: folderPath,
    fileName: "config",
    type: "json",
    allowOverride: false,
  });
  if (!configFileStatus.success) return configFileStatus;
  const chunkDataStatus = await readFile({
    filePath: joinPaths(folderPath, "chunks", "chunk-1"),
    type: "bin",
    typed: "Uint8Array",
  });
  const canvas = document.getElementById("editorCanvas") as HTMLCanvasElement;
  await Engine.initialize(canvas);
  if (typeof chunkDataStatus.data === "object") {
    let index = 0;
    for (let i = 0; i < chunkDataStatus.data.length; i += 3) {
      const tilePos = getTilePosition({
        chunkPos: { x: 0, y: 0 },
        chunkSize: projectConfig.chunkSize,
        tileIndex: index,
        tileSize: projectConfig.tileSize,
      });
      const tile = new Tile({
        pos: tilePos,
        size: { h: projectConfig.tileSize.h, w: projectConfig.tileSize.w },
        color: [
          chunkDataStatus.data[i],
          chunkDataStatus.data[i + 1],
          chunkDataStatus.data[i + 2],
        ],
        chunkIndex: 0,
        tileIndex: index,
      });
      Engine.addEntity(tile);
      index++;
    }
  }
  //TODO: po co mi w propsach ten defPath
  //TODO: zamienić budowanie pierwszego chunka z pliku na po prostu branie danych z configu, bo po co czytac dane które już masz
  GlobalStore.add(
    "currentProjectPath",
    `${projectConfig.projectPath}\\${projectConfig.name}`
  );
  GlobalStore.add("autoSaveProject", projectConfig.autosave);
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

  const chunkDataStatus = await readFile({
    filePath: joinPaths(folderPath, "chunks", "chunk-1"),
    type: "bin",
    typed: "Uint8Array",
  });
  if (!chunkDataStatus.success) return chunkDataStatus;

  const canvas = document.getElementById("editorCanvas") as HTMLCanvasElement;
  await Engine.initialize(canvas);

  if (typeof chunkDataStatus.data === "object") {
    let index = 0;
    for (let i = 0; i < chunkDataStatus.data.length; i += 3) {
      const tilePos = getTilePosition({
        chunkPos: { x: 0, y: 0 },
        chunkSize: config.chunkSize,
        tileIndex: index,
        tileSize: config.tileSize,
      });
      const tile = new Tile({
        pos: tilePos,
        size: { h: config.tileSize.h, w: config.tileSize.w },
        color: [
          chunkDataStatus.data[i],
          chunkDataStatus.data[i + 1],
          chunkDataStatus.data[i + 2],
        ],
        chunkIndex: 0,
        tileIndex: index,
      });
      Engine.addEntity(tile);
      index++;
    }
  }
  GlobalStore.add(
    "currentProjectPath",
    `${config.projectPath}\\${config.name}`
  );
  GlobalStore.add("autoSaveProject", config.autosave);

  return { error: "", success: true };
}
export async function saveProjectOnChange(
  chunkIndex: number,
  tileIndex: number
) {
  console.log("zapisuje...");
  const [projectPath] = GlobalStore.get<string>("currentProjectPath");

  const data = (Array.from(Engine.getEntities().values())[tileIndex] as Tile)
    .color;
  const ChunkFileStatus = await editFile({
    value: data,
    filePath: joinPaths(projectPath, "chunks", "chunk-1"),
    index: tileIndex * 3,
    type: "bin",
    typed: "Uint8Array",
  });
  return ChunkFileStatus;
}
export async function saveProject() {
  console.log("zapisuje...");
  const [projectPath] = GlobalStore.get<string>("currentProjectPath");

  const data = Array.from(Engine.getEntities().values())
    .map((ent) => (ent as Tile).color)
    .flat();

  const ChunkFileStatus = await createFile({
    data: data,
    dirPath: joinPaths(projectPath, "chunks"),
    fileName: "chunk-1",
    allowOverride: true,
    type: "bin",
    typed: "Uint8Array",
  });

  if (!ChunkFileStatus.success) return ChunkFileStatus;
  const chunkDataStatus = await readFile({
    filePath: joinPaths(projectPath, "chunks", "chunk-1"),
    type: "bin",
    typed: "Uint8Array",
  });
  return chunkDataStatus;
}
