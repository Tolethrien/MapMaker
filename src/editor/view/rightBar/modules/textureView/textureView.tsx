import { batch, createEffect, createSignal, For, Show } from "solid-js";
import TextureCanvas from "./textureCanvas";
import Link from "@/utils/link";
import ModuleFrame from "@/editor/components/module/moduleFrame";
import IconButton from "@/editor/components/buttonAsIcon";
import AddSVG from "@/assets/icons/add";
import ModuleSection from "@/editor/components/module/ModuleSection";
import TrashSVG from "@/assets/icons/trash";
import { sendNotification } from "@/utils/utils";
import AssetsManager, { TextureMeta } from "@/utils/assetsManger";
import ContextMenu from "@/editor/components/contextMenu/contextMenu";
import ContextButton from "@/editor/components/contextMenu/contextButton";
import TileSetViewModal from "./add/tilesetView";
import ObjectSetViewModal from "./add/objectSetView";
//TODO: ustawiam sporo modali wszedzie, moze by tak po prostu miec globalne isOpen by nie ptrzeba bylo drillowac propsami wszedzie,
//  i tak tylko jeden modal naraz masz otwarty
const BUTTON_ACTIVE =
  "px-5 py-2 bg-app-acc-purp w-fit rounded-t-md shadow-inner text-app-acc-wheat";
const BUTTON_INACTIVE =
  "px-5 py-2 bg-app-main-3 w-fit rounded-t-md shadow-inner text-app-acc-wheat-dark hover:bg-app-acc-purp hover:text-app-acc-wheat";
export default function TextureView() {
  const [textureView, setTextureView] = createSignal<TextureMeta | undefined>(
    undefined
  );
  const [textureList, setTextureList] = createSignal<TextureMeta[]>([]);
  //TODO: poprawic to
  const [isOpenModal, setIsOpenModal] = createSignal(true);
  const [pickedModal, setPickedModal] = createSignal<"tile" | "object">(
    "object"
  );
  const [pickTextureModal, setPickTextureModal] = createSignal(false);
  const config = Link.get<ProjectConfig>("projectConfig");
  const engineInit = Link.get<boolean>("engineInit");

  createEffect(() => {
    if (engineInit() && config().textureUsed.length > 0) {
      const id = config().textureUsed.at(-1)!.id;
      const texture = AssetsManager.getTexture(id);
      setTextureView(texture);
      console.log(AssetsManager.getTexturesArray());
      setTextureList(AssetsManager.getTexturesArray());
    }
  });
  const changeTexture = (id: string) => {
    const texture = AssetsManager.getTexture(id);
    setTextureView(texture);
  };
  const removeTexture = async () => {
    const texture = textureView();
    if (!texture) return;

    const { error, success } = await AssetsManager.removeTexture(texture.id);
    if (!success) {
      sendNotification({
        type: "error",
        value: `Something went wrong while removing Texture ${texture.name}. Error: ${error}`,
      });
      return;
    }
    if (config().textureUsed.length === 0) {
      setTextureView(undefined);
      setTextureList([]);
    }
    sendNotification({
      type: "success",
      value: `Texture ${texture.name} successfully removed`,
    });
  };
  return (
    <ModuleFrame title="Texture View" allowBeforeInit>
      <div class="border-b-4 border-app-acc-purp mt-4 flex items-end justify-between">
        <div class="flex overflow-x-auto gap-1 no-horizontal-scroll text-sm font-medium">
          <For each={textureList()}>
            {(item, index) => (
              <button
                onClick={() => changeTexture(item.id)}
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
          onClick={() => setPickTextureModal(true)}
          onBlur={() => setPickTextureModal(false)}
          scale={false}
          style="bg-app-acc-purp p-3 justify-self-end relative"
        >
          <AddSVG style="w-5 h-5" />
          <Show when={pickTextureModal()}>
            <div>
              <ContextMenu bound="right">
                <ContextButton
                  name="TileSet"
                  onClick={() => {
                    batch(() => {
                      setPickedModal("tile");
                      setIsOpenModal(true);
                      setPickTextureModal(false);
                    });
                  }}
                />
                <ContextButton
                  name="ObjectSet"
                  onClick={() => {
                    batch(() => {
                      setPickedModal("object");
                      setIsOpenModal(true);
                      setPickTextureModal(false);
                    });
                  }}
                />
              </ContextMenu>
            </div>
          </Show>
        </IconButton>
        <TileSetViewModal
          onOpen={() => isOpenModal() && pickedModal() === "tile"}
          onClose={() => setIsOpenModal(false)}
        />
        <ObjectSetViewModal
          onOpen={() => isOpenModal() && pickedModal() === "object"}
          onClose={() => setIsOpenModal(false)}
        />
      </div>
      <ModuleSection
        title="Detail"
        open={false}
        attachToTitle={
          <IconButton
            onClick={async (e) => {
              e.stopPropagation();
              e.preventDefault();
              removeTexture();
            }}
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
