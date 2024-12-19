import { API_DIALOG, API_FILE_SYSTEM } from "../preload/preload";
declare global {
  interface Window {
    API_DIALOG: typeof API_DIALOG;
    API_FILE_SYSTEM: typeof API_FILE_SYSTEM;
  }
}
