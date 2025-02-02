import { AvailableAPIs } from "./preload";

export const getAPI = <T extends AvailableAPIs>(apiName: T) =>
  window.API[apiName];
