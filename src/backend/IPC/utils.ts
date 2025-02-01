import { ipcMain } from "electron";
import path from "path";

export function utilsIPC() {
  ipcMain.handle("joinPath", joinPath);
}
async function joinPath(_: Electron.IpcMainInvokeEvent, segments: string[]) {
  return path.join(...segments);
}
