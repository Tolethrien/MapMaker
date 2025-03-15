import {
  batch,
  createEffect,
  createSignal,
  For,
  onMount,
  Show,
} from "solid-js";
import TextureCanvas from "./textureCanvas";
import Link from "@/utils/link";
import ModuleFrame from "@/editor/components/module/moduleFrame";
import IconButton from "@/editor/components/buttonAsIcon";
import AddSVG from "@/assets/icons/add";
import ModuleSection from "@/editor/components/module/ModuleSection";
import TrashSVG from "@/assets/icons/trash";
import { sendNotification } from "@/utils/utils";
import AssetsManager, { View } from "@/utils/assetsManger";
import ContextMenu from "@/editor/components/contextMenu/contextMenu";
import ContextButton from "@/editor/components/contextMenu/contextButton";
import TileSetViewModal from "./add/tilesetView";
import ObjectSetViewModal from "./add/objectSetView";
//TODO: ustawiam sporo modali wszedzie, moze by tak po prostu miec globalne isOpen by nie ptrzeba bylo drillowac propsami wszedzie,
//  i tak tylko jeden modal naraz masz otwarty
//TODO: nie czyszcza sie objectset ani tileSet podczas zamykania komponentu

const BUTTON_ACTIVE =
  "px-5 py-2 bg-app-acc-purp w-fit rounded-t-md shadow-inner text-app-acc-wheat";
const BUTTON_INACTIVE =
  "px-5 py-2 bg-app-main-3 w-fit rounded-t-md shadow-inner text-app-acc-wheat-dark hover:bg-app-acc-purp hover:text-app-acc-wheat";
export default function TextureView() {
  const [viewList, setViewList] = createSignal<View[]>([]);
  const [currentView, setCurrentView] = createSignal<View | undefined>(
    undefined
  );
  //TODO: poprawic to
  const [isOpenModal, setIsOpenModal] = createSignal(false);
  const [pickedModal, setPickedModal] = createSignal<"tile" | "object">(
    "object"
  );
  const [pickTextureModal, setPickTextureModal] = createSignal(false);
  const config = Link.get<ProjectConfig>("projectConfig");
  const engineInit = Link.get<boolean>("engineInit");
  const load = async () => {
    await AssetsManager.loadDataFromConfig();
    window.AMDEBUG = () => AssetsManager.DEBUG();
  };
  onMount(async () => {
    await load();
    console.log("mounted");
    setViewList(AssetsManager.getViews());
  });
  // createEffect(() => {
  //   if (engineInit() && config().textureUsed.length > 0) {
  //     const id = config().textureUsed.at(-1)!.id;
  //     const view = AssetsManager.getView(id);
  //     setCurrentView(view);
  //     console.log(AssetsManager.getTexturesArray());
  //     setViewList(AssetsManager.getViews());
  //   }
  // });
  const changeTexture = (id: string) => {
    const view = AssetsManager.getView(id);
    setCurrentView(view);
  };
  const removeTexture = async () => {
    const view = currentView();
    if (!view) return;

    const { error, success } = await AssetsManager.removeTexture(view.id);
    if (!success) {
      sendNotification({
        type: "error",
        value: `Something went wrong while removing Texture ${view.name}. Error: ${error}`,
      });
      return;
    }
    if (config().textureUsed.length === 0) {
      setCurrentView(undefined);
      setViewList([]);
    }
    sendNotification({
      type: "success",
      value: `Texture ${view.name} successfully removed`,
    });
  };
  return (
    <ModuleFrame title="Texture View" allowBeforeInit>
      <div class="border-b-4 border-app-acc-purp mt-4 flex items-end justify-between">
        <div class="flex overflow-x-auto gap-1 no-horizontal-scroll text-sm font-medium">
          <For each={viewList()}>
            {(item, index) => (
              <button
                onClick={() => changeTexture(item.id)}
                class={
                  item.id === currentView()?.id
                    ? BUTTON_ACTIVE
                    : BUTTON_INACTIVE
                }
              >
                {item.name.slice(0, 8)}
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
            disabled={() => currentView() === undefined}
          >
            <TrashSVG style="w-4 h-4" />
          </IconButton>
        }
      >
        <p class="overflow-hidden text-ellipsis whitespace-nowrap">
          Path:
          {currentView
            ? `...\\${AssetsManager.getTexture(currentView()!.textureUsed)
                ?.path.split("\\")
                .slice(-3)
                .join("\\")}`
            : ""}
        </p>
        <p>
          Crop: X:{currentView()?.tileSize.w ?? "0"}|Y:
          {currentView()?.tileSize.h ?? "0"}
        </p>
      </ModuleSection>
      <ModuleSection title={`${currentView() ? currentView()?.type : ""} Map`}>
        <Show
          when={currentView() !== undefined}
          fallback={
            <div class="bg-black w-full h-16 flex items-center justify-center">
              Load texture to display...
            </div>
          }
        >
          <div class="w-full object-none overflow-scroll h-52">
            {currentView()!.img}
            {/* <TextureCanvas texture={currentView()!} /> */}
          </div>
        </Show>
      </ModuleSection>
    </ModuleFrame>
  );
}
