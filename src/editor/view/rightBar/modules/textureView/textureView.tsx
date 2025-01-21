import { batch, createEffect, createSignal, For, Show } from "solid-js";
import TextureCanvas from "./textureCanvas";
import Link from "@/utils/link";
import NewTextureModal from "./addTexture";
import ModuleFrame from "@/editor/components/module/moduleFrame";
import IconButton from "@/editor/components/buttonAsIcon";
import AddSVG from "@/assets/icons/add";
import ModuleSection from "@/editor/components/module/ModuleSection";

const BUTTON_ACTIVE =
  "px-5 py-2 bg-app-acc-purp w-fit rounded-t-md shadow-inner text-app-acc-wheat";
const BUTTON_INACTIVE =
  "px-5 py-2 bg-app-main-3 w-fit rounded-t-md shadow-inner text-app-acc-wheat-dark hover:bg-app-acc-purp hover:text-app-acc-wheat";
export default function TextureView() {
  const [textureView, setTextureView] = createSignal<
    ProjectTextureFile | undefined
  >(undefined);
  const [textureIndex, setTextureIndex] = createSignal(0);
  const [isOpenModal, setIsOpenModal] = createSignal(false);
  const config = Link.get<ProjectConfig>("projectConfig");
  const engineInit = Link.get<boolean>("engineInit");

  createEffect(() => {
    if (engineInit() && config().textureUsed.length > 0)
      setTextureView(config().textureUsed[0]);
  });
  const changeTexture = (index: number) => {
    batch(() => {
      setTextureView(config().textureUsed[index]);
      setTextureIndex(index);
    });
  };
  return (
    <ModuleFrame title="Texture View">
      <div class="border-b-4 border-app-acc-purp mt-4 flex items-end justify-between">
        <div class="flex overflow-x-auto gap-1 no-horizontal-scroll text-sm font-medium">
          <For each={config().textureUsed}>
            {(item, index) => (
              <button
                onClick={() => changeTexture(index())}
                class={
                  item.path === textureView()?.path
                    ? BUTTON_ACTIVE
                    : BUTTON_INACTIVE
                }
              >
                {item.name}
              </button>
            )}
          </For>
        </div>
        <IconButton
          onClick={() => setIsOpenModal(true)}
          scale={false}
          style="bg-app-acc-purp p-3 justify-self-end"
        >
          <AddSVG style="w-5 h-5" />
        </IconButton>
        <NewTextureModal open={isOpenModal} setOpen={setIsOpenModal} />
      </div>
      <ModuleSection title="Detail" open={false}>
        <p class="">
          Path:
          {textureView()
            ? ` ...\\${textureView()?.path.split("\\").slice(-3).join("\\")}`
            : ""}
        </p>
        <p>
          Crop: X:{textureView()?.tileSize.w ?? "0"}|Y:
          {textureView()?.tileSize.h ?? "0"}
        </p>
      </ModuleSection>
      <ModuleSection title="Tile Map">
        <Show
          when={textureView() !== undefined}
          fallback={
            <div class="bg-black w-full h-16 flex items-center justify-center">
              Load texture to display...
            </div>
          }
        >
          <div class="w-full object-none overflow-scroll h-52">
            <TextureCanvas texture={textureView()!} index={textureIndex()} />
          </div>
        </Show>
      </ModuleSection>
    </ModuleFrame>
  );
}
