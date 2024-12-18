import { app, BrowserWindow, dialog } from "electron";
import path from "path";
import installExtention from "electron-devtools-installer";
import { setIPCHandlers } from "./IPC/ipc";
if (require("electron-squirrel-startup")) {
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

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#475569",
      height: 28,
      symbolColor: "#f5deb3",
    },
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  setIPCHandlers();
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) onDev();
  else onProd();
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
