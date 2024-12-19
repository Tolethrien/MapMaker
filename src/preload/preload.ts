import { DialogPickerPromise } from "@/backend/IPC/dialog";
import { CreateFile, FSStatus } from "@/backend/IPC/fileSystem";
import { contextBridge, ipcRenderer } from "electron";
export type AvailableAPIs = "API_DIALOG" | "API_FILE_SYSTEM";

export const API_DIALOG = {
  openFolderPicker: async (desc?: string): Promise<DialogPickerPromise> => {
    return await ipcRenderer.invoke("openFolderPicker", desc);
  },
  openFilePicker: async (desc?: string) => {
    return await ipcRenderer.invoke("openFilePicker", desc);
  },
};
export const API_FILE_SYSTEM = {
  createFolder: async (path: string): Promise<FSStatus> => {
    return await ipcRenderer.invoke("createFolder", path);
  },
  createFile: async (props: CreateFile) => {
    return await ipcRenderer.invoke("createFile", props);
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
export const getAPI = <T extends AvailableAPIs>(apiName: T) => window[apiName];
