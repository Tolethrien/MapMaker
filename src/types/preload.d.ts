import { API } from "../preload/preload";

declare global {
  interface Window {
    API: typeof API;
  }
  type AsyncStatus = { success: boolean; error: string };
}
