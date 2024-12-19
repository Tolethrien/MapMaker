import ContextMenu from "@/editor/components/reusable/contextMenu/contextMenu";
import FrameButton from "@/editor/components/frame/components/frameButton";
import ContextButton from "@/editor/components/reusable/contextMenu/contextButton";
import SecondLogo from "./components/secondLogo";
import ContextSubMenu from "../reusable/contextMenu/contextSubMenu";
import Modal from "../reusable/modal";
import { FrameContext, FrameModalType } from "./context/provider";
import { batch, useContext } from "solid-js";
import FrameModalList from "./modals";

export default function Frame() {
  const context = useContext(FrameContext);

  const openModal = (modalName: FrameModalType) => {
    batch(() => {
      context.setActiveButton("none");
      context.setModalOpen(true);
      context.setActiveModal(modalName);
    });
  };
  return (
    <>
      <div class="w-full h-[28px] app-drag text-wheat bg-slate-600 flex items-center justify-between pr-36 gap-4">
        <div class="flex h-full gap-1">
          <FrameButton name="File">
            <ContextMenu>
              <ContextButton
                name="New Project"
                onClick={() => openModal("NewProject")}
              />
              <ContextButton name="Open Project" onClick={() => {}} />
              <ContextSubMenu name="Save as">
                <ContextMenu>
                  <ContextButton name="Hehe" onClick={() => {}} />
                  <ContextButton name="Nene" onClick={() => {}} />
                </ContextMenu>
              </ContextSubMenu>
            </ContextMenu>
          </FrameButton>
          <FrameButton name="Edit"></FrameButton>
          <FrameButton name="Help"></FrameButton>
        </div>
        <SecondLogo />
      </div>
      <Modal open={context.isModalOpen}>
        <FrameModalList />
      </Modal>
    </>
  );
}
