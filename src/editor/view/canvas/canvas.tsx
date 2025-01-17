import { createSignal } from "solid-js";
import Selector from "./components/selectorBar/selector";
export default function Canvas() {
  let ref!: HTMLCanvasElement;
  const [size, setSize] = createSignal({ w: 600, h: 600 });
  //TODO: napraw rozmiarowanie bo dynamicznie przekazywane do tailwinda z sygnału nie dzialaja
  return (
    <div class="col-span-9 justify-center flex items-center">
      <div class="relative bg-black w-[97%] h-[96%] rounded-lg border-1 shadow-lg border-app-acc-gray">
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
