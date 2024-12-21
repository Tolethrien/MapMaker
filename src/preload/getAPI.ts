type AvailableAPIs = "API_DIALOG" | "API_FILE_SYSTEM";

export const getAPI = <T extends AvailableAPIs>(apiName: T) => window[apiName];
