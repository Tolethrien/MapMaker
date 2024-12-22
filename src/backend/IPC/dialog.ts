import { dialog, ipcMain } from "electron";
import { mainWindow } from "../main";
export interface DialogPickerPromise {
  canceled: boolean;
  filePaths: string[];
}
export function dialogIPC() {
  ipcMain.handle("openFolderPicker", openFolderPicker);
  ipcMain.handle("openFilePicker", openFilePicker);
}
async function openFolderPicker(_: Electron.IpcMainInvokeEvent, desc?: string) {
  return await dialog.showOpenDialog(mainWindow, {
    title: desc ?? "Choose folder",
    properties: ["openDirectory", "createDirectory"],
  });
}
async function openFilePicker(_: Electron.IpcMainInvokeEvent, desc?: string) {
  return await dialog.showOpenDialog(mainWindow, {
    title: desc ?? "Choose file",
    properties: ["multiSelections", "openFile"],
  });
}
