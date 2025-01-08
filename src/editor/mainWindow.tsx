import { Show, useContext } from "solid-js";
import Canvas from "./components/canvas/canvas";
import LeftBar from "./components/leftBar/leftBar";
import RightBar from "./components/rightBar/rightBar";
import { globalContext } from "./providers/global";

export default function MainWindow() {
  const { isLeftBarVisible, isRightBarVisible } = useContext(globalContext)!;
  return (
    <>
      <div class="w-full h-full flex bg-slate-800 text-white">
        <Show when={isLeftBarVisible()}>
          <LeftBar />
        </Show>
        <Canvas />
        <Show when={isRightBarVisible()}>
          <RightBar />
        </Show>
      </div>
    </>
  );
}
