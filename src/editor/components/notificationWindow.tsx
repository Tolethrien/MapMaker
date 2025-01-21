import { Note } from "@/preload/globalLinks";
import Link from "@/utils/link";
import IconButton from "./buttonAsIcon";
import TrashSVG from "@/assets/icons/trash";
import CloseSVG from "@/assets/icons/close";
import { batch, For, Setter } from "solid-js";
import NotificationSVG from "@/assets/icons/notification";
import DeleteSlotSVG from "@/assets/icons/deleteSlot";
const NOTE_COLOR = {
  error: "text-app-acc-red-light",
  info: "text-app-acc-wheat",
  success: "text-app-acc-green-light",
};
interface Props {
  isOpen: Setter<boolean>;
}
export default function NotificationWindow(props: Props) {
  const [notes, setNotes] = Link.getLink<Note[]>("notify");

  const removeSlot = (index: number) => {
    batch(() => {
      setNotes((prev) => {
        prev.splice(index, 1);
        return [...prev];
      });
      if (notes().length === 0) props.isOpen(false);
    });
  };
  return (
    <div class="absolute top-[28px] h-[calc(100%-28px)] w-[30%] right-0 z-50">
      <div class="flex flex-col bg-app-main-2 pl-4 pt-8 w-full h-[95%] translate-y-[2.5%] rounded-s-lg border-1 border-app-acc-gray">
        <div class="flex items-center gap-6">
          <p class="text-app-acc-wheat text-2xl">Notification</p>
          <IconButton
            onClick={() => {
              setNotes([]);
              props.isOpen(false);
            }}
          >
            <TrashSVG style="h-5 w-5" />
          </IconButton>
        </div>
        <IconButton
          onClick={() => props.isOpen(false)}
          style="absolute right-2 top-2"
        >
          <CloseSVG style="h-5 w-5" />
        </IconButton>
        <div class=" border-b-4 border-app-acc-gray w-[95%] rounded-md"></div>
        <div class="flex flex-col overflow-y-auto flex-grow py-2 gap-2">
          <For each={notes().toReversed()}>
            {(note, index) => (
              <div class="w-full border-1 border-app-acc-gray rounded-md px-1 py-2 flex items-center shadow-md hover:border-app-acc-ice">
                <NotificationSVG
                  type={note.type}
                  style="h-5 w-5 flex-shrink-0 pl-1"
                />
                <span
                  class={`flex-grow px-2 whitespace-nowrap text-ellipsis overflow-hidden ${
                    NOTE_COLOR[note.type]
                  }`}
                >
                  {note.value}
                </span>
                <IconButton
                  onClick={() => removeSlot(notes().length - 1 - index())}
                >
                  <DeleteSlotSVG style="h-5 w-5" />
                </IconButton>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}
