import { lazy, Show, useContext } from "solid-js";
import { FrameContext } from "../context/provider";

const MODAL_LIST = {
  NewProject: lazy(() => import("./newProject")),
};
export default function FrameModalList() {
  const context = useContext(FrameContext);
  const activeModal = () => context.getActiveModal();

  //TODO: how to fix this crap
  return (
    <Show
      //@ts-ignore
      when={activeModal() !== "none" && MODAL_LIST[activeModal()]}
      fallback={null}
    >
      {(ModalComponent) => <ModalComponent />}
    </Show>
  );
}
