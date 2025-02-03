import { createSignal, onMount } from "solid-js";
import Selector from "./components/selectorBar/selector";
import Engine from "@/engine/engine";
export default function Canvas() {
  let ref!: HTMLCanvasElement;
  const [size, setSize] = createSignal({ w: 600, h: 600 });
  //TODO: dodac zmienianie wielkosci canvasu na resize
  onMount(() => {
    const div = document.getElementById("canvaFrame");
    if (!div) {
      console.error("no canva frame in canvas component");
      return;
    }
    const rect = div.getBoundingClientRect();
    setSize({ w: rect.width, h: rect.height });
  });
  return (
    <div class="flex-[9] justify-center flex items-center">
      <div
        id="canvaFrame"
        class="relative bg-black w-[97%] h-[96%] rounded-lg border-1 shadow-lg border-app-acc-gray flex items-center justify-center"
      >
        <canvas
          ref={ref}
          id="editorCanvas"
          width={size().w}
          height={size().h}
        />
        <Selector />
      </div>
    </div>
  );
}
