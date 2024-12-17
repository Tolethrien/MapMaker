import Canvas from "./components/canvas";
import Frame from "./components/frame";
import LeftBar from "./components/leftBar";
import RightBar from "./components/rightBar";

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
