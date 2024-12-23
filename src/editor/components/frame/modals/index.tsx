import { lazy, Show, useContext } from "solid-js";
import { FrameContext } from "../context/provider";

const MODAL_LIST = {
  newProject: lazy(() => import("./newProject")),
  openProject: lazy(() => import("./openProject")),
};
export default function FrameModalList() {
  const context = useContext(FrameContext);

  //TODO: how to fix this crap
  return (
    <Show when={context.getActiveModal() !== "none"} fallback={null}>
      {
        //@ts-ignore
        MODAL_LIST[context.getActiveModal()]
      }
    </Show>
  );
}
