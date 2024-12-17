import Canvas from "./components/canvas";
import LeftBar from "./components/leftBar";
import RightBar from "./components/rightBar";

export default function App() {
  return (
    <div class="w-full h-full flex bg-slate-800 text-white">
      <LeftBar />
      <Canvas />
      <RightBar />
    </div>
  );
}
