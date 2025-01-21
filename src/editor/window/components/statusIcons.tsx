import NotificationSVG from "@/assets/icons/notification";
import IconButton from "@/editor/components/buttonAsIcon";
import NotificationWindow from "@/editor/components/notificationWindow";
import { Note } from "@/preload/globalLinks";
import Link from "@/utils/link";
import { createSignal, Show } from "solid-js";

export default function StatusIcons() {
  const notes = Link.get<Note[]>("notify");
  const [notifier, setNotifier] = createSignal(false);

  return (
    <>
      <Show when={notes().length > 0}>
        <IconButton
          onClick={() => setNotifier((prev) => !prev)}
          style="flex items-end app-prevent-drag items-center"
        >
          <Show when={notes().some((note) => note.type === "success")}>
            <NotificationSVG type="success" style="h-4 w-4" />
            <span class="px-1">
              {notes().filter((note) => note.type === "success").length}
            </span>
          </Show>
          <Show when={notes().some((note) => note.type === "info")}>
            <NotificationSVG type="info" style="h-4 w-4" />
            <span class="px-1">
              {notes().filter((note) => note.type === "info").length}
            </span>
          </Show>
          <Show when={notes().some((note) => note.type === "error")}>
            <NotificationSVG type="error" style="h-4 w-4" />
            <span class="px-1">
              {notes().filter((note) => note.type === "error").length}
            </span>
          </Show>
        </IconButton>
      </Show>
      <Show when={notifier()}>
        <NotificationWindow isOpen={setNotifier} />
      </Show>
    </>
  );
}
