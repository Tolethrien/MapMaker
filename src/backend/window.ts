import { BrowserWindow } from "electron";
import path from "path";
import installExtention from "electron-devtools-installer";
import { appIPC } from "./IPC/app";
import { dialogIPC } from "./IPC/dialog";
import { createAppSettings } from "./settings/app";
import { settingsIPC } from "./IPC/settings";
import { projectIPC } from "./IPC/project";
import { utilsIPC } from "./IPC/utils";

export let mainWindow: BrowserWindow;
export default function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#1A1A2E",
      height: 28,
      symbolColor: "#f5deb3",
    },
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  mainWindow.setBackgroundColor("#1A1A2E");
  mainWindow.on("close", (event) => {
    event.preventDefault();
    mainWindow.webContents.send("appCloseEvent", true);
  });
  IPCHandlers();
  createAppSettings();
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) onDev();
  else onProd();
}
function IPCHandlers() {
  dialogIPC();
  appIPC();
  settingsIPC();
  projectIPC();
  utilsIPC();
}
function onDev() {
  mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  try {
    installExtention("ckabpgjkjmbkfmichbbgcgbelkbbpopi");
  } catch (error) {
    console.error("Extension Error: ", error);
  }
  mainWindow.webContents.openDevTools();
}
function onProd() {
  mainWindow.loadFile(
    path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
  );
}
