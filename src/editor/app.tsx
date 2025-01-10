import { FrameProvider } from "./providers/frame";
import MainWindow from "./view/main";
import { GlobalProvider } from "./providers/global";
import initLinks from "@/API/links";
import Frame from "./window/frame/frame";

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
