import { dialogIPC } from "./dialog";
import { fileSystemIPC } from "./fileSystem";

export function setIPCHandlers() {
  dialogIPC();
  fileSystemIPC();
}
