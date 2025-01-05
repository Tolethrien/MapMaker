import { FrameProvider } from "./providers/frame";
import Frame from "./components/frame/frame";
import MainWindow from "./mainWindow";
import { GlobalProvider } from "./providers/global";

export default function App() {
  return (
    <GlobalProvider>
      <FrameProvider>
        <Frame />
      </FrameProvider>
      <MainWindow />
    </GlobalProvider>
  );
}
