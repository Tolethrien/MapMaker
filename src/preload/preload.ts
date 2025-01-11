import { DialogFileOptions, DialogPickerPromise } from "@/backend/IPC/dialog";
import { CreateFile, EditFile, ReadFile } from "@/backend/IPC/fileSystem";
import { contextBridge, FileFilter, ipcRenderer } from "electron";

export const API_DIALOG = {
  openFolderPicker: async (desc?: string): Promise<DialogPickerPromise> => {
    return await ipcRenderer.invoke("openFolderPicker", desc);
  },
  openFilePicker: async (
    config: DialogFileOptions
  ): Promise<DialogPickerPromise> => {
    return await ipcRenderer.invoke("openFilePicker", config);
  },
};
export const API_APP = {
  appClose: () => ipcRenderer.send("appClose"),
  appTerminate: () => ipcRenderer.send("appTerminate"),
  onAppCloseEvent: (e: () => void) => ipcRenderer.on("appCloseEvent", e),
};
export const API_FILE_SYSTEM = {
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
  readDir: async (
    path: string
  ): Promise<AsyncStatus & { paths: string[] | undefined }> => {
    return await ipcRenderer.invoke("readDir", path);
  },
  getAppPath: async (): Promise<AsyncStatus & { path: string }> => {
    return await ipcRenderer.invoke("getAppPath");
  },
  copyFile: async (from: string, to: string): Promise<AsyncStatus> => {
    return await ipcRenderer.invoke("copyFile", from, to);
  },
  loadTexture: async (path: string): Promise<AsyncStatus & { src: string }> => {
    return await ipcRenderer.invoke("loadTexture", path);
  },
};
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("API_DIALOG", API_DIALOG);
    contextBridge.exposeInMainWorld("API_FILE_SYSTEM", API_FILE_SYSTEM);
    contextBridge.exposeInMainWorld("API_APP", API_APP);
  } catch (error) {
    console.error(error);
  }
}
