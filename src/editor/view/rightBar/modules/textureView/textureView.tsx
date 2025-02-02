import { batch, createEffect, createSignal, For, Show } from "solid-js";
import TextureCanvas from "./textureCanvas";
import Link from "@/utils/link";
import NewTextureModal from "./addTexture";
import ModuleFrame from "@/editor/components/module/moduleFrame";
import IconButton from "@/editor/components/buttonAsIcon";
import AddSVG from "@/assets/icons/add";
import ModuleSection from "@/editor/components/module/ModuleSection";
import { deleteTexture } from "@/utils/projectUtils";
import Engine from "@/engine/engine";
import TrashSVG from "@/assets/icons/trash";
import { sendNotification } from "@/utils/utils";

const BUTTON_ACTIVE =
  "px-5 py-2 bg-app-acc-purp w-fit rounded-t-md shadow-inner text-app-acc-wheat";
const BUTTON_INACTIVE =
  "px-5 py-2 bg-app-main-3 w-fit rounded-t-md shadow-inner text-app-acc-wheat-dark hover:bg-app-acc-purp hover:text-app-acc-wheat";
export default function TextureView() {
  const [textureView, setTextureView] = createSignal<
    ProjectTextureFile | undefined
  >(undefined);
  const [isOpenModal, setIsOpenModal] = createSignal(false);
  const config = Link.get<ProjectConfig>("projectConfig");
  const engineInit = Link.get<boolean>("engineInit");
  createEffect(() => {
    if (engineInit() && config().textureUsed.length > 0)
      setTextureView(config().textureUsed[0]);
  });
  const changeTexture = (index: number) => {
    setTextureView(config().textureUsed[index]);
  };
  const removeTexture = async () => {
    const texture = textureView();
    if (!texture) return;
    const status = await deleteTexture(texture.id);
    if (!status.success) {
      sendNotification({
        type: "error",
        value: `Something went wrong while removing Texture ${texture.name}. Error: ${status.error}`,
      });
      return;
    }
    await Engine.reTexture();
    batch(() => {
      setTextureView(
        config().textureUsed.length > 0 ? config().textureUsed[0] : undefined
      );
    });
    sendNotification({
      type: "success",
      value: `Texture ${texture.name} successfully removed`,
    });
  };
  return (
    <ModuleFrame title="Texture View" allowBeforeInit={true}>
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
      <ModuleSection
        title="Detail"
        open={false}
        attachToTitle={
          <IconButton
            onClick={async () => removeTexture()}
            scale={false}
            disabled={() => textureView() === undefined}
          >
            <TrashSVG style="w-4 h-4" />
          </IconButton>
        }
      >
        <p class="overflow-hidden text-ellipsis whitespace-nowrap">
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
            <TextureCanvas texture={textureView()!} />
          </div>
        </Show>
      </ModuleSection>
    </ModuleFrame>
  );
}
