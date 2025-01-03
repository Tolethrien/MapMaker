import { appIPC } from "./app";
import { dialogIPC } from "./dialog";
import { fileSystemIPC } from "./fileSystem";

export default function setIPCHandlers() {
  dialogIPC();
  fileSystemIPC();
  appIPC();
}
