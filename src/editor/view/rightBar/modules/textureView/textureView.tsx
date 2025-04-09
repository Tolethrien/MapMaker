import { batch, createSignal, For, Show } from "solid-js";
import TextureCanvas from "./textureCanvas";
import ModuleFrame from "@/editor/components/module/moduleFrame";
import IconButton from "@/editor/components/buttonAsIcon";
import AddSVG from "@/assets/icons/add";
import ModuleSection from "@/editor/components/module/ModuleSection";
import TrashSVG from "@/assets/icons/trash";
import AssetsManager, { View } from "@/engine/core/modules/assetsManager";
import ContextMenu from "@/editor/components/contextMenu/contextMenu";
import ContextButton from "@/editor/components/contextMenu/contextButton";
import TileSetViewModal from "./add/tilesetView";
import StructSetViewModal from "./add/structSetView";
import EventBus from "@/utils/eventBus";
import CanvasController from "./canvasController";
import { sendNotification } from "@/utils/utils";

const BUTTON_ACTIVE =
  "px-5 py-2 bg-app-acc-purp w-fit rounded-t-md shadow-inner text-app-acc-wheat";
const BUTTON_INACTIVE =
  "px-5 py-2 bg-app-main-3 w-fit rounded-t-md shadow-inner text-app-acc-wheat-dark hover:bg-app-acc-purp hover:text-app-acc-wheat";
export default function TextureView() {
  const [viewList, setViewList] = createSignal<View[]>([]);
  const [currentView, setCurrentView] = createSignal<View | undefined>(
    undefined
  );
  const [isOpenModal, setIsOpenModal] = createSignal(false);
  const [pickedModal, setPickedModal] = createSignal<"tile" | "object">(
    "object"
  );
  const [pickTextureModal, setPickTextureModal] = createSignal(false);

  EventBus.on("reTexture", {
    name: "textureView",
    callback: () => {
      batch(() => {
        setViewList(AssetsManager.getViews());
        setCurrentView(viewList()[0]);
      });
    },
  });

  const changeTexture = (id: string) => {
    const view = AssetsManager.getView(id);
    setCurrentView(view);
  };
  const removeTexture = async () => {
    const view = currentView();
    if (!view) return;
    const { error, success } = await AssetsManager.deleteView(view.id);
    if (!success) {
      sendNotification({
        type: "error",
        value: `Something went wrong while removing Texture ${view.name}. Error: ${error}`,
      });
      return;
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
                  name="Tiles"
                  onClick={() => {
                    batch(() => {
                      setPickedModal("tile");
                      setIsOpenModal(true);
                      setPickTextureModal(false);
                    });
                  }}
                />
                <ContextButton
                  name="Structures"
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
        <StructSetViewModal
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
      <ModuleSection
        title={`${currentView() ? currentView()?.type : ""} Map`}
        attachToTitle={
          <Show when={currentView() !== undefined}>
            <div class="self-end">
              <IconButton
                scale={false}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  CanvasController.scale("up");
                }}
              >
                <AddSVG style="w-3 h-3" />
              </IconButton>
              <IconButton
                scale={false}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  CanvasController.scale("down");
                }}
              >
                <AddSVG style="w-3 h-3" />
              </IconButton>
            </div>
          </Show>
        }
      >
        <Show
          when={currentView() !== undefined}
          fallback={
            <div class="bg-black w-full h-16 flex items-center justify-center">
              Load texture to display...
            </div>
          }
        >
          <div class="w-full object-none overflow-scroll h-52">
            <TextureCanvas view={currentView} />
          </div>
        </Show>
      </ModuleSection>
    </ModuleFrame>
  );
}
