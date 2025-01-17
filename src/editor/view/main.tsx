import Canvas from "./canvas/canvas";
import RightBar from "./rightBar/rightBar";

export default function MainWindow() {
  return (
    <div class="w-full h-[calc(100%-28px)] grid grid-cols-12 bg-app-main-1 text-app-acc-wheat">
      <Canvas />
      <RightBar />
    </div>
  );
}
