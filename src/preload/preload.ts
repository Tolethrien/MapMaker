import { DialogFileOptions, DialogPickerPromise } from "@/backend/IPC/dialog";
import {
  CreateFile,
  EditFile,
  GetPaths,
  ReadFile,
} from "@/backend/IPC/fileSystem";
import {
  AddTextureFile,
  DeleteTextureFile,
  ReadChunk,
  WriteChunk,
  WriteConfig,
} from "@/backend/IPC/project";
import { AppSettings, RecentProject } from "@/backend/settings/app";
import { ChunkTemplate } from "@/engine/core/entitySystem/entities/chunk";
import Link from "@/utils/link";
import { contextBridge, ipcRenderer } from "electron";
export type AvailableAPIs = keyof typeof API;

const API_DIALOG = {
  openFolderPicker: async (desc?: string): Promise<DialogPickerPromise> => {
    return await ipcRenderer.invoke("openFolderPicker", desc);
  },
  openFilePicker: async (
    config: DialogFileOptions
  ): Promise<DialogPickerPromise> => {
    return await ipcRenderer.invoke("openFilePicker", config);
  },
};
const API_UTILS = {
  joinPath: async (...segments: string[]): Promise<string> =>
    await ipcRenderer.invoke("joinPath", segments),
};

const API_PROJECT = {
  readChunk: async (
    props: ReadChunk
  ): Promise<AsyncStatus & { data: ChunkTemplate | undefined }> => {
    return await ipcRenderer.invoke("readChunk", props);
  },
  writeChunk: async (props: WriteChunk): Promise<AsyncStatus> => {
    return await ipcRenderer.invoke("writeChunk", props);
  },
  readConfig: async (
    projectPath: string
  ): Promise<AsyncStatus & { data: ProjectConfig | undefined }> => {
    return await ipcRenderer.invoke("readConfig", projectPath);
  },
  writeConfig: async (props: WriteConfig): Promise<AsyncStatus> => {
    return await ipcRenderer.invoke("writeConfig", props);
  },
  createProjectBoilerplate: async (
    projectPath: string
  ): Promise<AsyncStatus> => {
    return await ipcRenderer.invoke("createProjectBoilerplate", projectPath);
  },
  addTextureFile: async (
    props: AddTextureFile
  ): Promise<AsyncStatus & { data: ProjectConfig | undefined }> => {
    return await ipcRenderer.invoke("addTextureFile", props);
  },
  deleteTextureFile: async (
    props: DeleteTextureFile
  ): Promise<AsyncStatus & { data: ProjectConfig | undefined }> => {
    return await ipcRenderer.invoke("deleteTextureFile", props);
  },
};
const API_APP = {
  appClose: () => ipcRenderer.send("appClose"),
  appTerminate: () => ipcRenderer.send("appTerminate"),
  onAppCloseEvent: (e: () => void) => ipcRenderer.on("appCloseEvent", e),
};
const API_FILE_SYSTEM = {
  createFolder: async (path: string): Promise<AsyncStatus> => {
    return await ipcRenderer.invoke("createFolder", path);
  },
  createFile: async (props: CreateFile): Promise<AsyncStatus> => {
    return await ipcRenderer.invoke("createFile", props);
  },
  readFile: async (
    props: ReadFile
  ): Promise<AsyncStatus & { data: Buffer | string | undefined }> => {
    return await ipcRenderer.invoke("readFile", props);
  },
  editFile: async (props: EditFile): Promise<AsyncStatus> => {
    return await ipcRenderer.invoke("editFile", props);
  },
  deleteFile: async (path: string): Promise<AsyncStatus> => {
    return await ipcRenderer.invoke("deleteFile", path);
  },
  fileExists: async (path: string): Promise<AsyncStatus> => {
    return await ipcRenderer.invoke("fileExists", path);
  },
  readDir: async (
    path: string
  ): Promise<AsyncStatus & { paths: string[] | undefined }> => {
    return await ipcRenderer.invoke("readDir", path);
  },
  getAppPath: async (where: GetPaths): Promise<string> => {
    return ipcRenderer.invoke("getPathTo", where);
  },
  copyFile: async (from: string, to: string): Promise<AsyncStatus> => {
    return await ipcRenderer.invoke("copyFile", from, to);
  },
  loadTexture: async (path: string): Promise<AsyncStatus & { src: string }> => {
    return await ipcRenderer.invoke("loadTexture", path);
  },
};
const API_SETTINGS = {
  getAppSettings: async (): Promise<
    AsyncStatus & { appSettings: AppSettings }
  > => {
    return await ipcRenderer.invoke("getAppSettings");
  },
  addToRecent: async (project: RecentProject): Promise<AsyncStatus> => {
    return await ipcRenderer.invoke("addToRecent", project);
  },
  deleteFromRecent: async (path: string): Promise<AsyncStatus> => {
    return await ipcRenderer.invoke("deleteFromRecent", path);
  },
};
export const API = {
  app: API_APP,
  dialog: API_DIALOG,
  fileSystem: API_FILE_SYSTEM,
  settings: API_SETTINGS,
  project: API_PROJECT,
  utils: API_UTILS,
};
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("API", API);
  } catch (error) {
    console.error(error);
  }
}
