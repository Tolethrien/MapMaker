import { dialog, ipcMain } from "electron";
import { mainWindow } from "../main";
export interface DialogPickerPromise {
  canceled: boolean;
  filePaths: string[];
}
export const dialogIPC = () => {
  //all exposes of a Dialog module
  ipcMain.handle("openFolderPicker", async (_, desc?: string) => {
    return await dialog.showOpenDialog(mainWindow, {
      title: desc ?? "Choose folder",
      properties: ["openDirectory", "createDirectory"],
    });
  });
  ipcMain.handle("openFilePicker", async (_, desc?: string) => {
    return await dialog.showOpenDialog(mainWindow, {
      title: desc ?? "Choose file",
      properties: ["multiSelections", "openFile"],
    });
  });
};
