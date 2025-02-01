import { app, ipcMain } from "electron";
import path from "path";
import { readFile, writeFile } from "fs/promises";
import { AppSettings, RecentProject } from "../settings/app";

const APP_SETTINGS_PATH = path.join(
  app.getPath("userData"),
  "appSettings.json"
);
// const USER_SETTINGS_PATH = path.join(
//   app.getPath("userData"),
//   "userSettings.json"
// );
export function settingsIPC() {
  ipcMain.handle("getAppSettings", getAppSettings);
  ipcMain.handle("addToRecent", addToRecent);
  ipcMain.handle("deleteFromRecent", deleteFromRecent);
}
async function getAppSettings(
  _: Electron.IpcMainInvokeEvent
): Promise<AsyncStatus & { appSettings?: AppSettings }> {
  try {
    const stringifyData = await readFile(APP_SETTINGS_PATH, {
      encoding: "utf-8",
    });
    const settings = JSON.parse(stringifyData) as AppSettings;
    return { error: "", success: true, appSettings: settings };
  } catch (error) {
    return { error: error.message, success: false };
  }
}
async function addToRecent(
  _: Electron.IpcMainInvokeEvent,
  project: RecentProject
): Promise<AsyncStatus> {
  try {
    const stringifyData = await readFile(APP_SETTINGS_PATH, {
      encoding: "utf-8",
    });
    const settings = JSON.parse(stringifyData) as AppSettings;
    if (settings.recentProjects.find((recent) => recent.path === project.path))
      return { error: "", success: true };
    settings.recentProjects.unshift(project);
    await writeFile(APP_SETTINGS_PATH, JSON.stringify(settings), {
      encoding: "utf-8",
    });
    return { error: "", success: true };
  } catch (error) {
    return { error: error.message, success: false };
  }
}
async function deleteFromRecent(
  _: Electron.IpcMainInvokeEvent,
  path: string
): Promise<AsyncStatus> {
  try {
    const stringifyData = await readFile(APP_SETTINGS_PATH, {
      encoding: "utf-8",
    });
    const settings = JSON.parse(stringifyData) as AppSettings;
    const index = settings.recentProjects.findIndex(
      (recent) => recent.path === path
    );
    if (index === -1)
      return {
        error: `there is no recent project with path ${path}`,
        success: false,
      };
    settings.recentProjects.splice(index, 1);
    await writeFile(APP_SETTINGS_PATH, JSON.stringify(settings), {
      encoding: "utf-8",
    });
    return { error: "", success: true };
  } catch (error) {
    return { error: error.message, success: false };
  }
}
