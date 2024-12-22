import { ipcMain } from "electron";
import { mkdir, readdir, readFile, writeFile } from "fs/promises";
const TYPED_ARRAY_MAP = {
  Int8Array,
  Uint8Array,
  Uint8ClampedArray,
  Int16Array,
  Uint16Array,
  Int32Array,
  Uint32Array,
  Float32Array,
  Float64Array,
};
type TypedKeys = keyof typeof TYPED_ARRAY_MAP;
type TypedValue<T extends TypedKeys> = InstanceType<
  (typeof TYPED_ARRAY_MAP)[T]
>;
export type FileType = "bin" | "txt" | "json";
interface CreateFileBase {
  fileName: string;
  dirPath: string;
  allowOverride?: boolean;
}
type BinaryFile = {
  type: "bin";
  typed: TypedKeys;
};

type NonBinaryFile = {
  type: "txt" | "json";
  typed?: never;
};
export type ReadFile = { filePath: string } & (BinaryFile | NonBinaryFile);

export type CreateFile = CreateFileBase &
  ((BinaryFile & { data: number[] }) | (NonBinaryFile & { data: string }));

export function fileSystemIPC() {
  ipcMain.handle("createFolder", createFolder);
  ipcMain.handle("createFile", createFile);
  ipcMain.handle("getAppPath", getAppPath);
  ipcMain.handle("readFile", readFromFile);
  ipcMain.handle("readDir", readFromDir);
}

async function createFolder(
  _: Electron.IpcMainInvokeEvent,
  folderPath: string
): Promise<AsyncStatus> {
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

async function createFile(
  _: Electron.IpcMainInvokeEvent,
  { data, fileName, dirPath, type, allowOverride = false, typed }: CreateFile
): Promise<AsyncStatus> {
  const filePath = `${dirPath}\\${fileName}.${type}`;
  const over = allowOverride ? {} : { flag: "wx" };
  try {
    if (typeof data === "string") {
      await writeFile(filePath, data, { encoding: "utf-8", ...over });
    } else {
      const typeArr = TYPED_ARRAY_MAP[typed];
      const typeData = new typeArr(data);
      await writeFile(filePath, Buffer.from(typeData.buffer), { ...over });
    }
    return { success: true, error: "" };
  } catch (error) {
    return {
      success: false,
      error: error.message || `Write File error while creating ${fileName}`,
    };
  }
}

async function getAppPath(): Promise<AsyncStatus & { path: string }> {
  try {
    return { success: true, error: "", path: __dirname };
  } catch (error) {
    return {
      success: false,
      error: error.message || `getAppPath error`,
      path: "",
    };
  }
}

//
async function readFromDir(
  _: Electron.IpcMainInvokeEvent,
  filePath: string
): Promise<AsyncStatus & { paths: string[] | undefined }> {
  try {
    const paths = await readdir(filePath);
    return { success: true, error: "", paths };
  } catch (error) {
    return {
      success: false,
      error: error.message || `readFile error from file: ${filePath}`,
      paths: undefined,
    };
  }
}
async function readFromFile<P extends TypedKeys>(
  _: Electron.IpcMainInvokeEvent,
  { filePath, type, typed }: ReadFile
): Promise<AsyncStatus & { data: TypedValue<P> | string | undefined }> {
  try {
    if (type === "json" || type === "txt") {
      const text = await readFile(`${filePath}.${type}`, { encoding: "utf-8" });
      return { success: true, error: "", data: text };
    } else {
      const buffer = await readFile(`${filePath}.${type}`);
      const typeArr = TYPED_ARRAY_MAP[typed];
      const dataView = new DataView(buffer.buffer);
      const length = buffer.length / typeArr.BYTES_PER_ELEMENT;
      const returnData = new typeArr(length);
      const method = `get${typed.replace("Array", "")}`;

      for (let i = 0; i < length; i++) {
        //magic fix just to let TS pass - this will be valid function name
        returnData[i] = (dataView as any)[method](
          i * typeArr.BYTES_PER_ELEMENT,
          true
        );
      }
      return { success: true, error: "", data: returnData as TypedValue<P> };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || `readFile error from file: ${filePath}`,
      data: undefined,
    };
  }
}
