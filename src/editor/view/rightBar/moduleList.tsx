import CheckboxSVG from "@/assets/icons/checkbox";
import OpenArrowSVG from "@/assets/icons/openArrow";
import IconButton from "@/editor/components/buttonAsIcon";
import { createSignal, Show } from "solid-js";

interface Props {
  position: "Bottom" | "Top";
}
export default function ModuleList(props: Props) {
  //Faktyczne wybieranie i ustawianie ktore moduly chcesz widziec
  const [isOpen, setIsOpen] = createSignal(false);
  const [activeModule, setActiveModule] = createSignal<"Render" | "Texture">(
    props.position === "Top" ? "Render" : "Texture"
  );
  return (
    <div class="w-full px-4 shadow-xl bg-app-main-3">
      <IconButton
        onClick={() => setIsOpen((prev) => !prev)}
        style="flex items-center justify-between w-full"
        scale={false}
      >
        <p>Modules</p>
        <OpenArrowSVG
          style={`w-4 h-4 stroke-app-acc-ice stroke-[6px] ${
            !isOpen() && "rotate-180"
          }`}
        />
      </IconButton>
      <Show when={isOpen()}>
        <div class="grid grid-cols-3">
          <IconButton
            onClick={() => setActiveModule("Render")}
            style="flex items-center gap-2 w-full"
            scale={false}
          >
            <CheckboxSVG
              checked={activeModule() === "Render"}
              style="w-5 h-5"
            />
            <p
              class={`whitespace-nowrap text-ellipsis overflow-hidden ${
                activeModule() === "Render" && "text-app-acc-green-light"
              }`}
            >
              Render Stats
            </p>
          </IconButton>
          <IconButton
            onClick={() => setActiveModule("Texture")}
            style="flex items-center gap-2 w-full"
            scale={false}
          >
            <CheckboxSVG
              checked={activeModule() === "Texture"}
              style="w-5 h-5"
            />
            <p
              class={`whitespace-nowrap text-ellipsis overflow-hidden ${
                activeModule() === "Texture" && "text-app-acc-green-light"
              }`}
            >
              Texture View
            </p>
          </IconButton>
        </div>
      </Show>
    </div>
  );
}
