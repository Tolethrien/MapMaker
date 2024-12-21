import { DialogPickerPromise } from "@/backend/IPC/dialog";
import { CreateFile } from "@/backend/IPC/fileSystem";
import { contextBridge, ipcRenderer } from "electron";

export const API_DIALOG = {
  openFolderPicker: async (desc?: string): Promise<DialogPickerPromise> => {
    return await ipcRenderer.invoke("openFolderPicker", desc);
  },
  openFilePicker: async (desc?: string) => {
    return await ipcRenderer.invoke("openFilePicker", desc);
  },
};
export const API_FILE_SYSTEM = {
  createFolder: async (path: string): Promise<AsyncStatus> => {
    return await ipcRenderer.invoke("createFolder", path);
  },
  createFile: async (props: CreateFile): Promise<AsyncStatus> => {
    return await ipcRenderer.invoke("createFile", props);
  },
  getAppPath: async (): Promise<AsyncStatus & { path: string }> => {
    return await ipcRenderer.invoke("getAppPath");
  },
};
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("API_DIALOG", API_DIALOG);
    contextBridge.exposeInMainWorld("API_FILE_SYSTEM", API_FILE_SYSTEM);
  } catch (error) {
    console.error(error);
  }
}
