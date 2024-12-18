import Canvas from "./components/canvas/canvas";
import Frame from "./components/frame/frame";
import LeftBar from "./components/leftBar/leftBar";
import RightBar from "./components/rightBar/rightBar";

export default function App() {
  return (
    <>
      <Frame />
      <div class="w-full h-full flex bg-slate-800 text-white">
        <LeftBar />
        <Canvas />
        <RightBar />
      </div>
    </>
  );
}
