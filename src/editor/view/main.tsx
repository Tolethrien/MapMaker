import Canvas from "./canvas/canvas";
import RightBar from "./rightBar/rightBar";

export default function MainWindow() {
  return (
    <div class="flex h-[calc(100%-28px)] bg-app-main-1 text-app-acc-wheat">
      <Canvas />
      <RightBar />
    </div>
  );
}
