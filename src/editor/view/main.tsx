import { Show, useContext } from "solid-js";
import Canvas from "./canvas/canvas";
import LeftBar from "./leftBar/leftBar";
import { globalContext } from "../providers/global";
import RightBar from "./rightBar/rightBar";

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
