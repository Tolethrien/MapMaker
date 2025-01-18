import { Accessor, batch, createSignal, Setter } from "solid-js";
import Modal from "../../../../components/modal";
import Button from "../../../../components/button";
import { getAPI } from "@/preload/getAPI";
import { saveTexture } from "@/preload/api/project";
import { createStore } from "solid-js/store";
import ArrowSVG from "@/assets/icons/sizeArrows";
import Engine from "@/engine/engine";
interface Props {
  open: Accessor<boolean>;
  setOpen: Setter<boolean>;
}
const { openFilePicker } = getAPI("API_DIALOG");

export default function NewTextureModal(props: Props) {
  const [loading, setLoading] = createSignal(false);
  const [state, setState] = createStore({
    path: "C:\\",
    file: "",
    tileSize: { w: 32, h: 32 },
  });

  const pickFile = async () => {
    const pathStatus = await openFilePicker({
      description: "select texture",
      filters: [{ name: "Images", extensions: ["jpg", "png"] }],
    });
    if (pathStatus.canceled) {
      console.log(pathStatus);
      return;
    }
    const path = pathStatus.filePaths[0];
    const file = path.split("\\").at(-1);
    if (!file) {
      console.error("no name or file string in textureView when adding");
      return;
    }
    batch(() => {
      setState("path", path);
      setState("file", file);
    });
  };
  const textureLoader = async () => {
    setLoading(true);
    const name = state.file.slice(0, -4);
    const saveStatus = await saveTexture(
      state.path,
      state.file,
      name,
      state.tileSize
    );
    if (!saveStatus.success) console.log("path", state.path, "name", name);
    await Engine.reTexture();
    batch(() => {
      setLoading(false);
      props.setOpen(false);
    });
  };
  return (
    <Modal open={props.open}>
      <div class="px-16 py-8 bg-app-bg-1 text-app-acc-wheat flex flex-col gap-4  items-center">
        <p>Load Tile Set</p>
        <label class="text-xl flex gap-4">
          File:
          <input
            class="border-b-main-4 bg-app-bg-3 border-b-1 rounded-sm"
            placeholder="C\\..."
            value={state.file}
          ></input>
          <button onClick={pickFile}>...</button>
        </label>
        <div class="relative flex flex-col items-center justify-center w-fit">
          <div class="relative">
            <ArrowSVG style="w-20 h-20 fill-app-acc-red" />
            <div class="w-10 h-10 bg-slate-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <input
            class="absolute top-1/2 -translate-y-[125%] right-full w-12 text-center  border-b-1 border-b-app-acc-wheat bg-transparent"
            value={state.tileSize.w}
            onInput={(e) => setState("tileSize", "w", Number(e.target.value))}
          ></input>
          <input
            class="border-b-1 border-b-wheat bg-transparent w-12 text-center"
            value={state.tileSize.h}
            onInput={(e) => setState("tileSize", "h", Number(e.target.value))}
          ></input>
        </div>
        <button
          class="bg-app-acc-red text-app-acc-wheat px-3 rounded-sm absolute top-0 right-0"
          onclick={() => props.setOpen(false)}
        >
          X
        </button>
        <Button
          name="Confirm"
          onClick={textureLoader}
          loading={loading}
        ></Button>
      </div>
    </Modal>
  );
}
