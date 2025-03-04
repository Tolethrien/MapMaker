import CloseSVG from "@/assets/icons/close";
import FolderSVG from "@/assets/icons/folder";
import PickerSVG from "@/assets/icons/picker";
import TrashSVG from "@/assets/icons/trash";
import IconButton from "@/editor/components/buttonAsIcon";
import Input from "@/editor/components/input";
import Modal from "@/editor/components/modal";
import AssetsManager from "@/utils/assetsManger";
import { sendNotification } from "@/utils/utils";
import {
  batch,
  createEffect,
  createSignal,
  For,
  onMount,
  Show,
} from "solid-js";
import { createStore } from "solid-js/store";
import ObjectCanvas, { ObjectSelector } from "./objectCanvas";
import { getAPI } from "@/preload/getAPI";
import AddSVG from "@/assets/icons/add";
import Button from "@/editor/components/button";
import { Structure } from "./objectStructure";

interface Props {
  onOpen: () => boolean;
  onClose: () => void;
}
const { openFilePicker } = getAPI("dialog");
//TODO: add warning of clarence on change texture or dims
export default function ObjectSetViewModal(props: Props) {
  let canvas!: HTMLCanvasElement;
  let selectRef!: HTMLSelectElement;
  let controller!: ObjectCanvas;
  const [textures, setTextures] = createSignal(
    AssetsManager.getTexturesArray()
  );
  const [objects, setObjects] = createSignal<Structure[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [currentSelector, setCurrentSelector] =
    createSignal<ObjectSelector>("path");

  onMount(async () => {
    if (canvas) {
      controller = new ObjectCanvas(canvas);
      controller.onLUTChange(() => {
        //stupid hack to force redraw without forcing all the object's to change signals(faster way)
        setObjects([]);
        setObjects(controller.getLUT());
      });
      await controller.generateImage(state.path);
      controller.changeDims(state.tileSize);
    }
  });
  const [state, setState] = createStore({
    path: "C:\\Users\\Tolet\\Desktop\\textures\\postapo.png",
    file: "",
    tileSize: { w: 32, h: 32 },
  });
  createEffect(
    () => props.onOpen() && setTextures(AssetsManager.getTexturesArray())
  );
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
    selectRef.selectedIndex = 0;
    await controller.generateImage(path);
  };
  const changeTileSize = (side: "w" | "h", size: number) => {
    setState("tileSize", side, size);
    controller.changeDims(state.tileSize);
  };
  const onRestore = () => {
    // controller.restoreState(currentSelector());
    // setRestoring(false);
  };
  const pickExistedTexture = async (index: number) => {
    await controller.generateImage(textures()[index].absolutePath);
    setState("path", "C:\\\\");
  };
  const textureLoader = async () => {
    // setLoading(true);
    // //TODO: why do i need success when i can just check is error undefined?
    // const { error, success, textureID } = await AssetsManager.uploadTexture(
    //   state.path,
    //   state.tileSize
    // );
    // const LUTData = controller.getLUT();
    // AssetsManager.addToTileLUT(LUTData, textureID);
    // if (!success) {
    //   sendNotification({
    //     type: "error",
    //     value: `Error compiling texture: "${error}"`,
    //   });
    //   setLoading(false);
    // }
    // sendNotification({
    //   type: "success",
    //   value: `Texture: "${state.path}" successfully added`,
    // });
    // batch(() => {
    //   setLoading(false);
    //   props.onClose();
    // });
  };
  const setSelector = (selector: ObjectSelector) => {
    setCurrentSelector(selector);
    controller.setSelector(selector);
  };
  return (
    <Modal open={props.onOpen}>
      <div class="pl-2 pr-8 pb-4 bg-app-main-2 text-app-acc-wheat flex flex-col  items-center">
        <button
          class="bg-app-acc-red text-app-acc-wheat rounded-sm absolute top-0 right-0"
          onclick={props.onClose}
        >
          <CloseSVG style="h-3 w-3 my-2 mx-3" />
        </button>
        <p class="text-3xl font-medium pb-4 pt-2">Object Sets</p>
        <div class="flex gap-4 justify-center">
          <div class="bg-app-main-3 flex flex-col shadow-inner h-[550px] self-center border-1 border-app-acc-gray">
            <p class="border-b-2 border-app-acc-gray text-center font-medium px-2 py-3">
              Object List
            </p>
            <div class="overflow-y-auto h-full py-2 min-w-72">
              <For each={objects().toReversed()}>
                {(item) => {
                  //TODO: add highlight on hover/click
                  const points = item.pointsPath;
                  return (
                    <div
                      class="relative bg-app-main-2 shadow-xl px-2 w-72 border-2 border-app-acc-gray text-sm"
                      data-id={item.getID}
                    >
                      <p class="text-sm">Path</p>
                      <p>
                        X:{points.A.x} Y:{points.A.y}
                      </p>
                      <p>
                        W:{points.B.x} H:{points.B.y}
                      </p>
                      <IconButton
                        onClick={() => controller.deleteStructure(item.getID)}
                        style="absolute top-1 right-1"
                        scale={false}
                      >
                        <TrashSVG style="w-5 h-5" />
                      </IconButton>
                      <div class="flex gap-4 absolute bottom-2 right-2">
                        <Show when={item.colliderTiles.size > 0}>
                          <TrashSVG style="w-3 h-3" />
                        </Show>
                        <Show when={item.anchorTile !== undefined}>
                          <TrashSVG style="w-3 h-3" />
                        </Show>
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>
          </div>
          <div>
            <p class="text-1xl font-medium py-2">
              Pick loaded texture or load new one...
            </p>
            <div class="flex justify-around">
              <select
                ref={selectRef}
                name="texture..."
                class="text-app-acc-wheat bg-app-main-3 px-16 outline-none border-1 border-app-acc-gray rounded-md"
                onChange={(e) => pickExistedTexture(e.target.selectedIndex - 1)}
              >
                <option value="" disabled selected hidden>
                  texture...
                </option>
                <For each={textures()}>
                  {(texture) => (
                    <option value={texture.id}>{texture.name}</option>
                  )}
                </For>
              </select>
              <div class="flex items-center">
                <FolderSVG style="w-5 h-5" />
                <label class="text-xl">
                  <span class="pr-4 pl-2">Path:</span>
                  <Input
                    placeholder="C\\..."
                    value={state.path}
                    type="selector"
                  />
                  <IconButton onClick={() => setProjectPath()}>
                    <PickerSVG style="w-5 h-5 ml-2 translate-y-3" />
                  </IconButton>
                </label>
              </div>
            </div>
            <div class="w-[890px] h-[500px] overflow-auto bg-black border-1 border-app-acc-gray mt-4">
              <canvas ref={canvas} width={0} height={0} />
            </div>
            <div class="flex justify-between w-full">
              <div class="flex bg-app-main-3 shadow-lg rounded-b-lg ml-3 border-1 border-app-acc-gray">
                {/* dimensions */}
                <div class="flex gap-4 py-2 px-6 relative pr-10">
                  <div>
                    <input
                      class="bg-transparent w-12 outline-none text-center"
                      value={state.tileSize.w}
                      onInput={(e) =>
                        changeTileSize("w", Number(e.target.value))
                      }
                    />
                    <p class="border-t-2 text-center w-12">width</p>
                  </div>
                  <div>
                    <input
                      class="bg-transparent w-12 outline-none text-center"
                      value={state.tileSize.h}
                      onInput={(e) =>
                        changeTileSize("h", Number(e.target.value))
                      }
                    />
                    <p class="border-t-2 text-center w-12">height</p>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value="255"
                    class="selectorVerticalRange -rotate-90 w-14 h-[6px] absolute left-full -translate-x-10 translate-y-6"
                    onInput={(e) =>
                      controller.setGridAlpha(Number(e.target.value))
                    }
                  />
                </div>
                {/* selectors */}
                <div class="flex gap-2 border-r-2 border-l-2 border-app-acc-gray p-2">
                  <IconButton
                    onClick={() => setSelector("path")}
                    scale={false}
                    style="flex flex-col items-center"
                  >
                    <AddSVG
                      style={`w-5 h-5 ${
                        currentSelector() === "path" && "stroke-app-acc-red"
                      }`}
                    />
                    <p>Path</p>
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
                  <IconButton
                    onClick={() => setSelector("anchor")}
                    scale={false}
                    style="flex flex-col items-center"
                  >
                    <AddSVG
                      style={`w-5 h-5 ${
                        currentSelector() === "anchor" && "stroke-app-acc-red"
                      }`}
                    />
                    <p>Anchor</p>
                  </IconButton>
                </div>
                {/* other */}
                <div class="flex p-2 relative">
                  {/* <IconButton
                    onClick={() => setSelector("select")}
                    scale={false}
                    style="flex flex-col items-center"
                  >
                    <AddSVG
                      style={`w-5 h-5 ${
                        currentSelector() === "select" && "stroke-app-acc-red"
                      }`}
                    />
                    <p>Select</p>
                  </IconButton> */}
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
        </div>
      </div>
    </Modal>
  );
}
