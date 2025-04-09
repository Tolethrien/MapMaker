import { FrameProvider } from "./providers/frame";
import MainWindow from "./view/main";
import { GlobalProvider } from "./providers/global";
import initLinks from "@/preload/globalLinks";
import Frame from "./window/frame";

export default function App() {
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
