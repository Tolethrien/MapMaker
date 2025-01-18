import Button from "../../../../components/button";
import { createSignal, For, Show } from "solid-js";
import TextureCanvas from "./textureCanvas";
import Link from "@/utils/link";
import NewTextureModal from "./addTexture";

export default function TextureView() {
  const [textureView, setTextureView] = createSignal(0);
  const [isOpenModal, setIsOpenModal] = createSignal(false);
  const config = Link.get<ProjectConfig>("projectConfig");
  const engineInit = Link.get<boolean>("engineInit");

  return (
    <div class="shadow-lg w-full">
      <p class="text-center bg-app-bg-4 w-full text-app-acc-red font-semibold text-lg">
        Texture view
      </p>
      <div class="overflow-y-auto max-h-80  border-2 border-app-bg-4 shadow-inner p-1 text-app-acc-wheat relative">
        <Show when={!engineInit()}>
          <div class="w-full h-full absolute top-0 left-0 bg-app-bg-1 z-50 opacity-70"></div>
        </Show>
        <div class="flex justify-between border-b-2 border-app-bg-4 my-2">
          <div class="flex gap-2 *:bg-app-bg-4 *:px-2 *:py-1">
            <For each={config().textureUsed}>
              {(item, index) => (
                <button onClick={() => setTextureView(index())}>
                  {item.name}
                </button>
              )}
            </For>
          </div>
          <Button
            name="Add"
            onClick={() => setIsOpenModal(true)}
            style="scale-90"
          />
          <NewTextureModal open={isOpenModal} setOpen={setIsOpenModal} />
        </div>
        {/* <div class="flex justify-between">
          <div class="flex gap-2 *:bg-app-bg-4 *:px-2 *:py-1">
            <button>view1</button>
            <button>view2</button>
            <button>view3</button>
          </div>
          <div>
            <Button name="+" onClick={() => {}} style="scale-75" />
            <Button name="-" onClick={() => {}} style="scale-75" />
          </div>
        </div> */}
        <div class="w-full object-none overflow-scroll h-52">
          <For each={config().textureUsed}>
            {(texture, index) => (
              <Show when={textureView() === index()}>
                <TextureCanvas texture={texture} index={index()} />
              </Show>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}
