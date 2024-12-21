import Engine from "@/engine/engine";
import { getAPI } from "@/preload/getAPI";
import { joinPaths } from "@/utils/utils";

const { createFolder, createFile } = getAPI("API_FILE_SYSTEM");
export interface NewProjectProps {
  dirPath: string;
  name: string;
  defaultPath: string;
  tileSize: { x: number; y: number };
  chunkSize: { x: number; y: number };
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

  const data = Array(256 * 10).fill(Math.random() * 10);
  const ChunkFileStatus = await createFile({
    data: new Float32Array(data),
    dirPath: joinPaths(folderPath, "chunks"),
    fileName: "chunk-1",
    type: "bin",
    allowOverride: false,
  });
  if (!ChunkFileStatus.success) return ChunkFileStatus;

  const { defaultPath, dirPath, ...configData } = props;
  const configFileStatus = await createFile({
    data: JSON.stringify({ ...configData, dirPath: folderPath }),
    dirPath: folderPath,
    fileName: "config",
    type: "json",
    allowOverride: false,
  });
  if (!configFileStatus.success) return configFileStatus;
  const canvas = document.getElementById("editorCanvas") as HTMLCanvasElement;
  await Engine.initialize(canvas);
  return { error: "", success: true };
}
