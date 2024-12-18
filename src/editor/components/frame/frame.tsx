import { createEffect, createSignal, Show } from "solid-js";
import ContextMenu from "@/editor/components/reusable/contextMenu/contextMenu";
import FrameButton from "@/editor/components/frame/components/frameButton";
import ContextButton from "@/editor/components/reusable/contextMenu/contextButton";
import SecondLogo from "./components/secondLogo";
import ContextSubMenu from "../reusable/contextMenu/contextSubMenu";
import NewProjectWindow from "./newProject";
import Modal from "../reusable/modal";
export type ButtonTypes = "File" | "Edit" | "Help" | "none";

export default function Frame() {
  const [activeButton, setActiveButton] = createSignal<ButtonTypes>("none");
  const [activeModal, setActiveModal] = createSignal<boolean>(false);

  const newProject = () => {
    setActiveModal(true);
    setActiveButton("none");
  };
  return (
    <>
      <div class="w-full h-[28px] app-drag text-wheat bg-slate-600 flex items-center justify-between pr-36 gap-4">
        <div class="flex h-full gap-1">
          <FrameButton
            getter={activeButton}
            setter={setActiveButton}
            name="File"
          >
            <ContextMenu>
              <ContextButton name="New Project" onClick={newProject} />
              <ContextButton name="Open Project" onClick={() => {}} />
              <ContextSubMenu name="Save as">
                <ContextMenu>
                  <ContextButton name="Hehe" onClick={() => {}} />
                  <ContextButton name="Nene" onClick={() => {}} />
                </ContextMenu>
              </ContextSubMenu>
            </ContextMenu>
          </FrameButton>
          <FrameButton
            getter={activeButton}
            setter={setActiveButton}
            name="Edit"
          ></FrameButton>
          <FrameButton
            getter={activeButton}
            setter={setActiveButton}
            name="Help"
          ></FrameButton>
        </div>
        <SecondLogo />
      </div>
      <Modal open={activeModal}>
        <NewProjectWindow closeModal={setActiveModal} />
      </Modal>
    </>
  );
}
