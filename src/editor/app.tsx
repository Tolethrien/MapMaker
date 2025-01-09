import { FrameProvider } from "./providers/frame";
import Frame from "./components/frame/frame";
import MainWindow from "./mainWindow";
import { GlobalProvider } from "./providers/global";
import initLinks from "@/API/links";

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
