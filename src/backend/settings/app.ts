import { app } from "electron";
import { access, writeFile } from "fs/promises";
import path from "path";

export type RecentProject = { name: string; path: string };
export interface AppSettings {
  recentProjects: RecentProject[];
}
const APP_SETTINGS: AppSettings = {
  recentProjects: [],
};
export async function createAppSettings() {
  const settingsPath = path.join(app.getPath("userData"), "appSettings.json");
  try {
    await access(settingsPath);
  } catch {
    await writeFile(settingsPath, JSON.stringify(APP_SETTINGS), {
      encoding: "utf-8",
    });
  }
}
