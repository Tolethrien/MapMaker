import Engine from "@/engine/engine";
import Tile from "@/engine/sandbox/entities/tile";
import { getAPI } from "@/preload/getAPI";
import { getTilePosition } from "@/utils/chunk";
import { joinPaths } from "@/utils/utils";

const { createFolder, createFile, readFile } = getAPI("API_FILE_SYSTEM");
export interface NewProjectProps {
  dirPath: string;
  name: string;
  defaultPath: string;
  tileSize: { w: number; h: number };
  chunkSize: { w: number; h: number };
  infinite: boolean;
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

  const data: number[] = Array(props.chunkSize.w * props.chunkSize.h)
    .fill(null)
    .map((_, index) => index);
  const ChunkFileStatus = await createFile({
    data: data,
    dirPath: joinPaths(folderPath, "chunks"),
    fileName: "chunk-1",
    allowOverride: false,
    type: "bin",
    typed: "Int16Array",
  });
  if (!ChunkFileStatus.success) return ChunkFileStatus;

  const projectConfig = {
    name: props.name,
    tileSize: props.tileSize,
    chunkSize: props.chunkSize,
    projectPath: props.dirPath,
    isInfinite: props.infinite,
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
    typed: "Int16Array",
  });
  const canvas = document.getElementById("editorCanvas") as HTMLCanvasElement;
  await Engine.initialize(canvas);
  if (typeof chunkDataStatus.data === "object") {
    chunkDataStatus.data.forEach((chunk) => {
      const tilePos = getTilePosition({
        chunkPos: { x: 0, y: 0 },
        chunkSize: projectConfig.chunkSize,
        tileIndex: chunk,
        tileSize: projectConfig.tileSize,
      });
      const tile = new Tile({
        pos: tilePos,
        size: { h: projectConfig.tileSize.h, w: projectConfig.tileSize.w },
      });
      Engine.addEntity(tile);
    });
  }
  //TODO: zamienić budowanie pierwszego chunka z pliku na po prostu branie danych z configu, bo po co czytac dane które już masz

  return { error: "", success: true };
}
