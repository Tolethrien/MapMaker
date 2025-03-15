import { FrameProvider } from "./providers/frame";
import MainWindow from "./view/main";
import { GlobalProvider } from "./providers/global";
import initLinks from "@/preload/globalLinks";
import Frame from "./window/frame";
import AssetsManager from "@/utils/assetsManger";

export default function App() {
  //TODO: usun to zaraz

  initLinks();
  return (
    <GlobalProvider>
      <FrameProvider>
        <Frame />
      </FrameProvider>
      <MainWindow />
    </GlobalProvider>
  );
}
