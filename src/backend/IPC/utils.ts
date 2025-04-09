import { app, ipcMain } from "electron";
import path from "path";

export type GetPaths =
  | "current"
  | "desktop"
  | "documents"
  | "userData"
  | "temp";
export function utilsIPC() {
  ipcMain.handle("joinPath", joinPath);
  ipcMain.handle("getPathTo", getPathTo);
  ipcMain.handle("getFileName", getFileName);
}
async function joinPath(_: Electron.IpcMainInvokeEvent, segments: string[]) {
  return path.join(...segments);
}
function getPathTo(_: Electron.IpcMainInvokeEvent, where: GetPaths): string {
  if (where === "current") return app.getAppPath();
  return app.getPath(where);
}
function getFileName(_: Electron.IpcMainInvokeEvent, filePath: string): string {
  return path.basename(filePath);
}
