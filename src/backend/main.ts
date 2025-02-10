import { app, protocol, BrowserWindow } from "electron";
import starter from "electron-squirrel-startup";
import createWindow from "./window";
import { registerProtocols, registerSchemes } from "./protocols/protocols";
if (starter) {
  app.quit();
}

export let mainWindow: BrowserWindow;

registerSchemes();

app.on("ready", () => {
  registerProtocols();
  createWindow();
});
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
