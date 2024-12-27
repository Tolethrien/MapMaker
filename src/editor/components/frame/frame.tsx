import ContextMenu from "@/editor/components/reusable/contextMenu/contextMenu";
import FrameButton from "@/editor/components/frame/components/frameButton";
import ContextButton from "@/editor/components/reusable/contextMenu/contextButton";
import SecondLogo from "@editor/components/frame/components/secondLogo";
import Modal from "@editor/components/reusable/modal";
import {
  FrameContext,
  FrameModalType,
} from "@editor/components/frame/context/provider";
import { batch, useContext } from "solid-js";
import FrameModalList from "./modals";
import { saveProject } from "@/API/project";
import { getAPI } from "@/preload/getAPI";

export default function Frame() {
  const context = useContext(FrameContext);

  const openModal = (modalName: FrameModalType) => {
    batch(() => {
      context.setActiveButton("none");
      context.setActiveModal(modalName);
      context.setModalOpen(true);
    });
  };
  const onSaveProject = async () => {
    const saveStatus = await saveProject();
    if (!saveStatus.success) console.log(saveStatus);
    context.setActiveButton("none");
  };
  const onAppExit = () => {
    const { appTerminate } = getAPI("API_APP");
    appTerminate();
  };

  return (
    <>
      <div class="w-full h-[28px] app-drag text-wheat bg-main-3 flex items-center justify-between pr-36 gap-4">
        <div class="flex h-full gap-1">
          <FrameButton name="File">
            <ContextMenu>
              <ContextButton
                name="New Project"
                onClick={() => openModal("newProject")}
              />
              <ContextButton
                name="Open Project"
                onClick={() => openModal("openProject")}
              />

              <ContextButton name="Save Project" onClick={onSaveProject} />
              <ContextButton name="Exit" onClick={onAppExit} />
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
