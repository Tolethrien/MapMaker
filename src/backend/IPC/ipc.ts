import { getSelectFolderDialog } from "./dialog";
import { createFolder } from "./fileSystem";

export function setIPCHandlers() {
  getSelectFolderDialog();
  createFolder();
}
