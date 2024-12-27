import { app, ipcMain } from "electron";
import { mainWindow } from "../main";

export function appIPC() {
  ipcMain.on("appTerminate", appTerminate);
}
async function appTerminate() {
  app.quit();
}
