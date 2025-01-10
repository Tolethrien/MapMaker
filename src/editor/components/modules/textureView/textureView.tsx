import world from "@/assets/world.png";
import flora from "@/assets/flora.png";
import Button from "../../reusable/button";
import { createSignal, Show } from "solid-js";
import TextureCanvas from "./textureCanvas";
export default function TextureView() {
  const [textureView, setTextureView] = createSignal(1);
  return (
    <div class="shadow-lg w-full">
      <p class="text-center bg-app-bg-4 w-full text-app-acc-red font-semibold text-lg">
        Texture view
      </p>
      <div class="overflow-y-auto max-h-80  border-2 border-app-bg-4 shadow-inner p-1 text-app-acc-wheat">
        <div class="flex justify-between border-b-2 border-app-bg-4 my-2">
          <div class="flex gap-2 *:bg-app-bg-4 *:px-2 *:py-1">
            <button onClick={() => setTextureView(1)}>texture1</button>
            <button onClick={() => setTextureView(2)}>texture2</button>
            <button>texture3</button>
          </div>
          <Button name="Add" onClick={() => {}} style="scale-90" />
        </div>
        <div class="flex justify-between">
          <div class="flex gap-2 *:bg-app-bg-4 *:px-2 *:py-1">
            <button>view1</button>
            <button>view2</button>
            <button>view3</button>
          </div>
          <div>
            <Button name="+" onClick={() => {}} style="scale-75" />
            <Button name="-" onClick={() => {}} style="scale-75" />
          </div>
        </div>
        <div class="w-full object-none overflow-scroll h-52">
          <Show when={textureView() === 1}>
            <TextureCanvas image={world} />
          </Show>
          <Show when={textureView() === 2}>
            <TextureCanvas image={flora} />
          </Show>
        </div>
      </div>
    </div>
  );
}
