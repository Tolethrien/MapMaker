import { dialog, ipcMain } from "electron";
import { mainWindow } from "../main";
export const getSelectFolderDialog = () => {
  ipcMain.handle("openFolderPicker", async () => {
    return await dialog.showOpenDialog(mainWindow, {
      title: "Wybierz lokalizację dla nowego folderu",
      properties: ["openDirectory", "createDirectory"],
    });
  });
};
