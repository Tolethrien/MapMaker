import ContextMenu from "@/editor/components/reusable/contextMenu/contextMenu";
import FrameButton from "@/editor/components/frame/components/frameButton";
import ContextButton from "@/editor/components/reusable/contextMenu/contextButton";
import SecondLogo from "@editor/components/frame/components/secondLogo";
import Modal from "@editor/components/reusable/modal";
import {
  FrameContext,
  FrameModalType,
} from "@editor/components/frame/context/provider";
import { batch, createSignal, useContext } from "solid-js";
import FrameModalList from "./modals";
import { closeProject } from "@/API/project";
import { getAPI } from "@/preload/getAPI";
import EventBus from "@/engine/core/modules/eventBus/eventBus";

export default function Frame() {
  const context = useContext(FrameContext);
  const [initButtonDisable, setInitButtonDisable] = createSignal(true);
  const { onAppCloseEvent, appClose } = getAPI("API_APP");

  //crating event to block buttons on inactive engine
  EventBus.on("engineInit", {
    name: "frameButtons",
    callback: (e: boolean) => setInitButtonDisable(!e),
  });
  //assigning opening modal to closeApp event
  onAppCloseEvent(() => {
    openModal("closeApp");
  });

  const openModal = (modalName: FrameModalType) => {
    batch(() => {
      context.setActiveButton("none");
      context.setActiveModal(modalName);
      context.setModalOpen(true);
    });
  };
  const onSaveProject = async () => {
    // const saveStatus = await saveChunk();
    // if (!saveStatus.success) console.log(saveStatus);
    context.setActiveButton("none");
  };
  const onCloseProject = async () => {
    closeProject();
    context.setActiveButton("none");
  };
  const onAppExit = () => {
    appClose();
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

              <ContextButton
                name="Save Project"
                onClick={onSaveProject}
                disable={initButtonDisable}
              />
              <ContextButton
                name="Close Project"
                onClick={onCloseProject}
                disable={initButtonDisable}
              />
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
