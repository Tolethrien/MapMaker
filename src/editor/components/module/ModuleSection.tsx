import { createSignal, JSXElement, Show } from "solid-js";
import IconButton from "../buttonAsIcon";
import OpenArrowSVG from "@/assets/icons/openArrow";

interface Props {
  title: string;
  children: JSXElement;
  open?: boolean;
  attachToTitle?: JSXElement;
}
export default function ModuleSection(props: Props) {
  const [isOpen, setIsOpen] = createSignal<boolean>(props.open ?? true);

  return (
    <div class="border-b-1 border-app-acc-purp">
      <IconButton
        onClick={() => setIsOpen((prev) => !prev)}
        scale={false}
        style="bg-app-acc-purp text-center flex w-full justify-center items-center relative !p-0"
      >
        <div class="flex gap-3 items-center">
          <p>{props.title}</p>
          <Show when={props.attachToTitle}>{props.attachToTitle}</Show>
        </div>
        <OpenArrowSVG
          style={`w-4 h-4 stroke-app-acc-ice stroke-[6px] absolute right-2 ${
            !isOpen() && "rotate-180"
          }`}
        />
      </IconButton>

      <Show when={isOpen()}>
        <div class="p-2">{props.children}</div>
      </Show>
    </div>
  );
}
