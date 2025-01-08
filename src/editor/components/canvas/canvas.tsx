import { createSignal } from "solid-js";
import Selector from "../selectorBar/selector";
export default function Canvas() {
  let ref!: HTMLCanvasElement;
  const [size, setSize] = createSignal({ w: 600, h: 600 });

  return (
    <div class="flex flex-grow w-fit justify-center bg-app-bg-1 relative">
      <canvas
        ref={ref}
        id="editorCanvas"
        width={size().w}
        height={size().h}
        class={`border border-app-acc-wheat w-[${size().w}px] h-[${
          size().h
        }px]`}
      />
      <Selector />
    </div>
  );
}
