import { contextBridge, ipcRenderer } from "electron";

export const API = {
  openFolderPicker: async () => {
    return await ipcRenderer.invoke("openFolderPicker");
  },
  createFolder: (path: string) => {
    return ipcRenderer.send("createFolder", path);
  },
};
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("API", API);
  } catch (error) {
    console.error(error);
  }
}
