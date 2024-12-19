import { ipcMain } from "electron";
import { mkdir, writeFile } from "fs/promises";
export type FileType = "bin" | "txt" | "json" | "mge";
export interface CreateFile {
  fileName: string;
  type: FileType;
  dirPath: string;
  data: string | NodeJS.ArrayBufferView<ArrayBufferLike>;
  allowOverride?: boolean;
}
export type FSStatus = { success: boolean; error: "" };
export const fileSystemIPC = () => {
  //all exposes of a FS module

  ipcMain.handle(
    "createFolder",
    async (_, folderPath: string): Promise<FSStatus> => {
      try {
        await mkdir(folderPath, { recursive: false });
        return { success: true, error: "" };
      } catch (error) {
        return {
          success: false,
          error: error.message || `MkDir error while creating ${folderPath}`,
        };
      }
    }
  );

  ipcMain.handle(
    "createFile",
    async (
      _,
      { data, fileName, dirPath, type, allowOverride = false }: CreateFile
    ): Promise<FSStatus> => {
      try {
        const filePath = `${dirPath}\\${fileName}.${type}`;
        if (allowOverride) await writeFile(filePath, data);
        else await writeFile(filePath, data, { flag: "wx" });

        return { success: true, error: "" };
      } catch (error) {
        return {
          success: false,
          error: error.message || `Write File error while creating ${fileName}`,
        };
      }
    }
  );
};
