import { Accessor, createSignal, Setter, Show } from "solid-js";
import Modal from "../../../../../components/modal";
import CloseSVG from "@/assets/icons/close";
import TileSetView from "./tilesetView";
import ObjectSetView from "./objectSetView";
interface Props {
  open: Accessor<boolean>;
  setOpen: Setter<boolean>;
}
type View = "Tileset" | "Object";
export default function NewTextureModal(props: Props) {
  const [view, setView] = createSignal<View>("Tileset");
  //TODO: zrobic by byl jakis globalny dialog do ktorego przypisujesz komponent a nie tak ze dialogi sa w komponentach, uzyj portalu albo po prostu globalnego komponentu
  return (
    <Modal open={props.open}>
      <div class="px-16 py-8 bg-app-main-2 text-app-acc-wheat flex flex-col gap-4  items-center">
        <button
          class="bg-app-acc-red text-app-acc-wheat rounded-sm absolute top-0 right-0"
          onclick={() => props.setOpen(false)}
        >
          <CloseSVG style="h-3 w-3 my-2 mx-3" />
        </button>
        <p>New View</p>
        <div class="flex gap-4">
          <button onClick={() => setView("Tileset")}>Tileset View</button>
          <button onClick={() => setView("Object")}>Object View</button>
        </div>
        <div>
          <Show when={view() === "Tileset"}>
            <TileSetView setOpen={props.setOpen} />
          </Show>
          <Show when={view() === "Object"}>
            <ObjectSetView setOpen={props.setOpen} />
          </Show>
        </div>
      </div>
    </Modal>
  );
}
