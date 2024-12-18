import { ipcMain } from "electron";
import { mkdirSync } from "fs";
export const createFolder = () => {
  ipcMain.on("createFolder", (_, path: string) => {
    mkdirSync(path);
  });
};
