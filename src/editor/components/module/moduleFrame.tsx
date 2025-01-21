import { JSXElement, Show } from "solid-js";
import IconButton from "../buttonAsIcon";
import GearSVG from "@/assets/icons/gear";
import CloseSVG from "@/assets/icons/close";
import Link from "@/utils/link";

interface Props {
  children: JSXElement;
  title: string;
  pinnedComponent?: JSXElement;
  allowBeforeInit: boolean;
}
export default function ModuleFrame(props: Props) {
  //TODO: settings oraz close
  const engineInit = Link.get<boolean>("engineInit");
  return (
    <div class="relative border-b-[3px] border-t-[3px]  border-app-acc-purp shadow-lg">
      <div class="flex items-center relative bg-app-acc-purp text-app-acc-wheat font-medium text-xl justify-center">
        <p class="text-center px-2">{props.title}</p>
        <IconButton onClick={() => {}}>
          <GearSVG style="w-4 h-4 fill-app-acc-wheat" />
        </IconButton>
        <IconButton onClick={() => {}} style="absolute right-2">
          <CloseSVG style="w-4 h-4" />
        </IconButton>
      </div>
      <div class={`${!engineInit() && "brightness-50 pointer-events-none"}`}>
        <Show when={props.pinnedComponent}>
          <div class="border-b-1 border-app-acc-purp">
            {props.pinnedComponent}
          </div>
        </Show>
        <div class="overflow-y-auto h-full flex flex-col gap-1">
          {props.children}
        </div>
      </div>
    </div>
  );
}
