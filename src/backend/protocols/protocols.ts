import { net, protocol } from "electron";
import { pathToFileURL } from "url";
export const registerSchemes = () => {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: "media",
      privileges: {
        secure: true,
        supportFetchAPI: true,
        bypassCSP: true,
        stream: true,
      },
    },
  ]);
};
export const registerProtocols = () => {
  protocol.handle("media", (request) => {
    const urlObj = new URL(request.url);
    let filePath = decodeURIComponent(urlObj.pathname);
    return net.fetch(pathToFileURL(filePath).toString());
  });
};
