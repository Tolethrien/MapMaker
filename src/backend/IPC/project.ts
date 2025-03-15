import { ChunkTemplate } from "@/engine/core/entitySystem/entities/chunk";
import { ipcMain } from "electron";
import { mkdir, readFile, writeFile, copyFile as copy, rm } from "fs/promises";
import path from "path";
export type ReadChunk = { projectPath: string; index: number };
export type WriteChunk = {
  projectPath: string;
  chunk: ChunkTemplate;
  allowOverride?: boolean;
};
export type WriteConfig = {
  projectPath: string;
  config: ProjectConfig;
  allowOverride?: boolean;
};
export type WriteTextureLUT = {
  projectPath: string;
  config: TextureConfig;
  allowOverride?: boolean;
};
export type AddTextureFile = {
  projectPath: string;
  filePath: string;
  id: string;
};
export type DeleteTextureFile = { projectPath: string; fileID: string };
export function projectIPC() {
  ipcMain.handle("readChunk", readChunk);
  ipcMain.handle("readConfig", readConfig);
  ipcMain.handle("writeConfig", writeConfig);
  ipcMain.handle("readTextureLUT", readTextureLUT);
  ipcMain.handle("writeTextureLUT", writeTextureLUT);
  ipcMain.handle("writeChunk", writeChunk);
  ipcMain.handle("createProjectBoilerplate", createProjectBoilerplate);
  ipcMain.handle("addTextureFile", addTextureFile);
  ipcMain.handle("deleteTextureFile", deleteTextureFile);
}

async function readChunk(
  _: Electron.IpcMainInvokeEvent,
  { index, projectPath }: ReadChunk
): Promise<AsyncStatus & { data: ChunkTemplate | undefined }> {
  const chunksPath = path.join(projectPath, "chunks", `chunk-${index}.json`);
  return await readJSON(chunksPath);
}

async function writeChunk(
  _: Electron.IpcMainInvokeEvent,
  { chunk, projectPath, allowOverride }: WriteChunk
): Promise<AsyncStatus> {
  const chunksPath = path.join(
    projectPath,
    "chunks",
    `chunk-${chunk.index}.json`
  );
  return await writeJSON(chunksPath, chunk, allowOverride);
}
async function readConfig(
  _: Electron.IpcMainInvokeEvent,
  projectPath: string
): Promise<AsyncStatus & { data: ProjectConfig | undefined }> {
  const configPath = path.join(projectPath, `config.json`);
  return await readJSON(configPath);
}
async function writeConfig(
  _: Electron.IpcMainInvokeEvent,
  { config, projectPath, allowOverride }: WriteConfig
): Promise<AsyncStatus> {
  const configPath = path.join(projectPath, "config.json");
  return await writeJSON(configPath, config, allowOverride);
}
async function writeTextureLUT(
  _: Electron.IpcMainInvokeEvent,
  { config, projectPath, allowOverride }: WriteTextureLUT
): Promise<AsyncStatus> {
  const configPath = path.join(projectPath, "textures", "textureLUT.json");
  return await writeJSON(configPath, config, allowOverride);
}
async function readTextureLUT(
  _: Electron.IpcMainInvokeEvent,
  projectPath: string
): Promise<AsyncStatus & { data: ProjectConfig | undefined }> {
  const configPath = path.join(projectPath, "textures", "textureLUT.json");
  return await readJSON(configPath);
}

async function createProjectBoilerplate(
  _: Electron.IpcMainInvokeEvent,
  projectPath: string
): Promise<AsyncStatus> {
  try {
    await mkdir(projectPath, { recursive: false });
    await mkdir(path.join(projectPath, "chunks"), { recursive: false });
    await mkdir(path.join(projectPath, "textures"), { recursive: false });
    await writeTextureLUT(_, {
      config: { objects: [], textures: [], tiles: [], views: [] },
      projectPath,
      allowOverride: false,
    });
    return { error: "", success: true };
  } catch (error) {
    return { error: error, success: false };
  }
}
async function addTextureFile(
  _: Electron.IpcMainInvokeEvent,
  { filePath, projectPath, id }: AddTextureFile
): Promise<AsyncStatus & { data: TextureConfig | undefined }> {
  const fileName = path.basename(filePath);
  const to = path.join(projectPath, "textures", fileName);
  const configPath = path.join(projectPath, "textures", "textureLUT.json");
  try {
    await copy(filePath, to);
    const { data } = await readJSON<TextureConfig>(configPath);
    data!.textures.push({
      absolutePath: to,
      name: id,
      path: `media:${to}`,
      id,
    });
    await writeJSON(configPath, data);
    return { success: true, error: "", data };
  } catch (error) {
    return { success: false, error: error, data: undefined };
  }
}
async function deleteTextureFile(
  _: Electron.IpcMainInvokeEvent,
  { fileID, projectPath }: DeleteTextureFile
): Promise<AsyncStatus & { data: ProjectConfig | undefined }> {
  //TODO: do zmiany
  const configPath = path.join(projectPath, "config.json");
  let config: ProjectConfig;
  try {
    const { data } = await readJSON<ProjectConfig>(configPath);
    config = data!;
  } catch (error) {
    return { success: false, error: error, data: undefined };
  }
  const index = config.textureUsed.findIndex(
    (texture) => texture.id === fileID
  );
  if (index === -1)
    return {
      data: undefined,
      error: `err:deleteTexture - no texture with this ID: ${fileID}`,
      success: false,
    };
  const filePath = config.textureUsed[index].path;
  config.textureUsed.splice(index, 1);
  try {
    await rm(filePath);
    await writeJSON(configPath, config);
    return { success: true, error: "", data: config };
  } catch (error) {
    return { success: false, error: error, data: undefined };
  }
}

async function readJSON<T>(
  path: string
): Promise<AsyncStatus & { data: T | undefined }> {
  try {
    const stringed = await readFile(path, { encoding: "utf-8" });

    return { success: true, error: "", data: JSON.parse(stringed) };
  } catch (error) {
    return { data: undefined, error: error, success: false };
  }
}
async function writeJSON<T>(
  path: string,
  data: T,
  allowOverride = true
): Promise<AsyncStatus> {
  const over = allowOverride ? {} : { flag: "wx" };
  try {
    await writeFile(path, JSON.stringify(data), {
      encoding: "utf-8",
      ...over,
    });
    return { success: true, error: "" };
  } catch (error) {
    return { error: error, success: false };
  }
}
