import { createSignal } from "solid-js";
import Selector from "../../components/modules/selectorBar/selector";
export default function Canvas() {
  let ref!: HTMLCanvasElement;
  const [size, setSize] = createSignal({ w: 600, h: 600 });
  //TODO: napraw rozmiarowanie bo dynamicznie przekazywane do tailwinda z sygnału nie dzialaja
  return (
    <div class="flex flex-grow justify-center bg-app-bg-1 relative">
      <canvas
        ref={ref}
        id="editorCanvas"
        width={size().w}
        height={size().h}
        class={`border border-app-acc-wheat h-[600px] w-[600px]`}
      />
      <Selector />
    </div>
  );
}
