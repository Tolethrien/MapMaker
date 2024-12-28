import { app, ipcMain } from "electron";

export function appIPC() {
  ipcMain.on("appTerminate", appTerminate);
  ipcMain.on("appClose", appClose);
}
async function appClose() {
  app.quit();
}
async function appTerminate() {
  app.exit();
}
