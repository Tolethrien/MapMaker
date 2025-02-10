import { Accessor, batch, createSignal, Setter, Show } from "solid-js";
import Modal from "../../../../components/modal";
import Button from "../../../../components/button";
import { getAPI } from "@/preload/getAPI";
import { createStore } from "solid-js/store";
import ArrowSVG from "@/assets/icons/sizeArrows";
import Engine from "@/engine/engine";
import FolderSVG from "@/assets/icons/folder";
import Input from "@/editor/components/input";
import IconButton from "@/editor/components/buttonAsIcon";
import PickerSVG from "@/assets/icons/picker";
import CloseSVG from "@/assets/icons/close";
import { sendNotification } from "@/utils/utils";
// import { addTexture } from "@/utils/projectUtils";
import AssetsManager from "@/utils/assetsManger";
interface Props {
  open: Accessor<boolean>;
  setOpen: Setter<boolean>;
}
const { openFilePicker } = getAPI("dialog");

export default function NewTextureModal(props: Props) {
  const [loading, setLoading] = createSignal(false);
  const [state, setState] = createStore({
    path: "C:\\",
    file: "",
    tileSize: { w: 16, h: 16 },
  });

  const pickFile = async () => {
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
    });
  };
  const textureLoader = async () => {
    setLoading(true);
    const { error, success } = await AssetsManager.uploadTexture(
      state.path,
      state.tileSize
    );
    // const { error, success } = await addTexture(state.path, state.tileSize);
    if (!success) {
      sendNotification({
        type: "error",
        value: `Error compiling texture: "${error}"`,
      });
      setLoading(false);
    }
    await Engine.reTexture();
    sendNotification({
      type: "success",
      value: `Texture: "${state.path}" successfully added`,
    });
    batch(() => {
      setLoading(false);
      props.setOpen(false);
    });
  };
  return (
    <Modal open={props.open}>
      <div class="px-16 py-8 bg-app-main-2 text-app-acc-wheat flex flex-col gap-4  items-center">
        <button
          class="bg-app-acc-red text-app-acc-wheat rounded-sm absolute top-0 right-0"
          onclick={() => props.setOpen(false)}
        >
          <CloseSVG style="h-3 w-3 my-2 mx-3" />
        </button>

        <p class="text-3xl">Load Tile Set</p>
        <div class="flex items-center">
          <FolderSVG style="w-5 h-5" />
          <label class="text-xl">
            <span class="pr-4 pl-2">Path:</span>
            <Input placeholder="C\\..." value={state.path} type="selector" />
            <IconButton onClick={pickFile}>
              <PickerSVG style="w-5 h-5 ml-2 translate-y-3" />
            </IconButton>
          </label>
        </div>
        <div class="pb-6">
          <p class="text-center text-2xl flex flex-col">
            Tile Crop
            <span class="text-xs">(in pixels)</span>
          </p>
          <div class="flex justify-around">
            <div class="relative">
              <input
                class="absolute text-right top-1/2 -translate-y-1/2 right-full w-8 bg-transparent border-b-2 border-app-acc-wheat outline-none"
                value={state.tileSize.w}
                onInput={(e) =>
                  setState("tileSize", "w", Number(e.target.value))
                }
              />
              <ArrowSVG style="w-20 h-20 fill-app-acc-red" />
              <div class="w-10 h-10 bg-slate-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <input
                class="absolute text-center top-full -translate-x-1/2 left-1/2 w-10 bg-transparent border-b-2 border-app-acc-wheat outline-none"
                value={state.tileSize.h}
                onInput={(e) =>
                  setState("tileSize", "h", Number(e.target.value))
                }
              />
            </div>
          </div>
        </div>
        <Button
          name="Confirm"
          onClick={textureLoader}
          loading={loading}
          style="w-full"
        />
      </div>
    </Modal>
  );
}
