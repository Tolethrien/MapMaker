import AddSVG from "@/assets/icons/add";
import CloseSVG from "@/assets/icons/close";
import FolderSVG from "@/assets/icons/folder";
import PickerSVG from "@/assets/icons/picker";
import Button from "@/editor/components/button";
import IconButton from "@/editor/components/buttonAsIcon";
import Input from "@/editor/components/input";
import Modal from "@/editor/components/modal";
import { getAPI } from "@/preload/getAPI";
import AssetsManager from "@/utils/assetsManger";
import { sendNotification } from "@/utils/utils";
import { batch, createSignal, onMount, Show } from "solid-js";
import { createStore } from "solid-js/store";
import Can, { Selector } from "./temp";

interface Props {
  onOpen: () => boolean;
  onClose: () => void;
}
const { openFilePicker } = getAPI("dialog");
//TODO: add a info window that texture is bigger then grid and have some leftovers (eg. 5 px in 16x16 grid)
//TODO: mouse wheel moves canvas AND create AABB
export default function TileSetViewModal(props: Props) {
  let canvas!: HTMLCanvasElement;
  let controller!: Can;
  const [loading, setLoading] = createSignal(false);
  const [restoring, setRestoring] = createSignal(false);
  const [currentSelector, setCurrentSelector] =
    createSignal<Selector>("included");

  const [state, setState] = createStore({
    path: "C:\\Users\\Tolet\\Desktop\\textures\\postapo.png",
    file: "",
    tileSize: { w: 32, h: 32 },
  });
  onMount(async () => {
    if (canvas) {
      controller = new Can(canvas);
      await controller.generateImage(state.path);
      controller.changeDims(state.tileSize);
    }
  });

  const setProjectPath = async () => {
    const pathStatus = await openFilePicker({
      description: "select texture",
      filters: [{ name: "Images", extensions: ["jpg", "png"] }],
    });
    if (pathStatus.canceled) return;
    const path = pathStatus.filePaths[0];
    const file = path.split("\\").at(-1);
    if (!file) {
      sendNotification({
        type: "error",
        value: `something went wrong when loading texture ${file}`,
      });
      return;
    }
    batch(() => {
      setState("path", path);
      setState("file", file);
      setState("tileSize", { w: 16, h: 16 });
    });
    await controller.generateImage(path);
  };
  const changeTileSize = (side: "w" | "h", size: number) => {
    setState("tileSize", side, size);
    controller.changeDims(state.tileSize);
  };
  const onRestore = () => {
    controller.restoreState(currentSelector());
    setRestoring(false);
  };
  const textureLoader = async () => {
    setLoading(true);
    //TODO: why do i need success when i can just check is error undefined?
    const { error, success, textureID } = await AssetsManager.uploadTexture(
      state.path,
      state.tileSize
    );
    const LUTData = controller.getLUT();
    AssetsManager.addToTileLUT(LUTData, textureID);
    if (!success) {
      sendNotification({
        type: "error",
        value: `Error compiling texture: "${error}"`,
      });
      setLoading(false);
    }
    sendNotification({
      type: "success",
      value: `Texture: "${state.path}" successfully added`,
    });
    batch(() => {
      setLoading(false);
      props.onClose();
    });
  };
  const setSelector = (selector: Selector) => {
    setCurrentSelector(selector);
    controller.setSelector(selector);
  };
  return (
    <Modal open={props.onOpen}>
      <div class="px-16 pb-8 pt-4 bg-app-main-2 text-app-acc-wheat flex flex-col  items-center">
        <button
          class="bg-app-acc-red text-app-acc-wheat rounded-sm absolute top-0 right-0"
          onclick={props.onClose}
        >
          <CloseSVG style="h-3 w-3 my-2 mx-3" />
        </button>

        <p class="text-3xl font-medium">Tile Sets</p>
        <div>
          <p class="text-center">load texture...</p>
          {/*TODO: change to component cause it's used in like 6 places  */}
          <div class="flex items-center">
            <FolderSVG style="w-5 h-5" />
            <label class="text-xl">
              <span class="pr-4 pl-2">Path:</span>
              <Input placeholder="C\\..." value={state.path} type="selector" />
              <IconButton onClick={setProjectPath}>
                <PickerSVG style="w-5 h-5 ml-2 translate-y-3" />
              </IconButton>
            </label>
          </div>
        </div>
        {/* //TODO: change to scale, not magic number */}

        <div class="w-[890px] h-[500px] overflow-auto bg-black border-1 border-app-acc-gray mt-4">
          <canvas ref={canvas} width={0} height={0} />
        </div>
        <div class="flex justify-between w-full">
          <div class=" relative flex bg-app-main-3 shadow-lg rounded-b-lg ml-3 border-1 border-app-acc-gray">
            <Show when={restoring()}>
              <div class="absolute left-0 top-0 w-full h-full bg-black opacity-50 rounded-b-lg" />
            </Show>
            {/* dimensions */}
            <div class="flex gap-4 py-2 px-6 relative pr-10">
              <div>
                <input
                  class="bg-transparent w-12 outline-none text-center"
                  value={state.tileSize.w}
                  onInput={(e) => changeTileSize("w", Number(e.target.value))}
                />
                <p class="border-t-2 text-center w-12">width</p>
              </div>
              <div>
                <input
                  class="bg-transparent w-12 outline-none text-center"
                  value={state.tileSize.h}
                  onInput={(e) => changeTileSize("h", Number(e.target.value))}
                />
                <p class="border-t-2 text-center w-12">height</p>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value="255"
                class="selectorVerticalRange -rotate-90 w-14 h-[6px] absolute left-full -translate-x-10 translate-y-6"
                onInput={(e) => controller.setGridAlpha(Number(e.target.value))}
              />
            </div>
            {/* selectors */}
            <div class="flex gap-2 border-r-2 border-l-2 border-app-acc-gray p-2">
              <IconButton
                onClick={() => setSelector("included")}
                scale={false}
                style="flex flex-col items-center"
              >
                <AddSVG
                  style={`w-5 h-5 ${
                    currentSelector() === "included" && "stroke-app-acc-red"
                  }`}
                />
                <p>Included</p>
              </IconButton>
              <IconButton
                onClick={() => setSelector("collider")}
                scale={false}
                style="flex flex-col items-center"
              >
                <AddSVG
                  style={`w-5 h-5 ${
                    currentSelector() === "collider" && "stroke-app-acc-red"
                  }`}
                />
                <p>Collider</p>
              </IconButton>
            </div>
            {/* other */}
            <div class="flex p-2 relative">
              <IconButton
                onClick={() => setRestoring(true)}
                scale={false}
                style="flex flex-col items-center"
              >
                <AddSVG style="w-5 h-5" />
                <p>Restore</p>
              </IconButton>
              <Show when={restoring()}>
                <div class="absolute -right-4 bottom-full bg-app-main-2 border-1 border-app-acc-gray rounded-md flex flex-col py-2 px-4">
                  <p class="whitespace-nowrap">
                    restore {currentSelector()} to default?
                  </p>
                  <div class="flex gap-4">
                    <button onClick={onRestore}>Yes!</button>
                    <button onClick={() => setRestoring(false)}>No!</button>
                  </div>
                </div>
              </Show>
            </div>
          </div>

          <Button
            name="Confirm"
            onClick={textureLoader}
            style="w-44 h-fit self-center"
            loading={loading}
          />
        </div>
      </div>
    </Modal>
  );
}
