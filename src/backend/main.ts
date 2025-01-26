import { app, BrowserWindow } from "electron";
import starter from "electron-squirrel-startup";
import createWindow from "./window";
if (starter) {
  app.quit();
}

export let mainWindow: BrowserWindow;

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
