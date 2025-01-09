import ContextMenu from "@/editor/components/reusable/contextMenu/contextMenu";
import FrameButton from "@/editor/components/frame/components/frameButton";
import ContextButton from "@/editor/components/reusable/contextMenu/contextButton";
import SecondLogo from "@editor/components/frame/components/secondLogo";
import Modal from "@editor/components/reusable/modal";
import {
  FrameContext as frameCtx,
  FrameModalType,
} from "@/editor/providers/frame";
import { globalContext as globalCtx } from "@/editor/providers/global";
import { batch, useContext } from "solid-js";
import FrameModalList from "./modals";
import { closeProject } from "@/API/project";
import { getAPI } from "@/preload/getAPI";
import Link from "@/vault/link";

export default function Frame() {
  const frameContext = useContext(frameCtx)!;
  const globalContext = useContext(globalCtx)!;
  const { onAppCloseEvent, appClose } = getAPI("API_APP");
  const engineInit = Link.get<boolean>("engineInit");
  const isEngineInit = () => !engineInit();

  //assigning opening modal to closeApp event
  onAppCloseEvent(() => {
    openModal("closeApp");
  });

  const openModal = (modalName: FrameModalType) => {
    batch(() => {
      frameContext.setActiveButton("none");
      frameContext.setActiveModal(modalName);
      frameContext.setModalOpen(true);
    });
  };
  const onSaveProject = async () => {
    // const saveStatus = await saveChunk();
    // if (!saveStatus.success) console.log(saveStatus);
    frameContext.setActiveButton("none");
  };
  const onCloseProject = async () => {
    closeProject();
    frameContext.setActiveButton("none");
  };
  const onAppExit = () => {
    appClose();
  };

  return (
    <>
      <div class="w-full h-[28px] app-drag text-app-acc-wheat bg-app-bg-3 flex items-center justify-between pr-36 gap-4">
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
                disable={isEngineInit}
              />
              <ContextButton
                name="Close Project"
                onClick={onCloseProject}
                disable={isEngineInit}
              />
              <ContextButton name="Exit" onClick={onAppExit} />
            </ContextMenu>
          </FrameButton>
          <FrameButton name="Project"></FrameButton>
          <FrameButton name="Editor">
            <ContextMenu>
              <ContextButton
                name={`Left Bar: ${
                  globalContext.isLeftBarVisible() ? "On" : "Off"
                }`}
                onClick={() =>
                  globalContext.setIsLeftBarVisible((prev) => !prev)
                }
              />
              <ContextButton
                name={`Right Bar: ${
                  globalContext.isRightBarVisible() ? "On" : "Off"
                }`}
                onClick={() =>
                  globalContext.setIsRightBarVisible((prev) => !prev)
                }
              />
            </ContextMenu>
          </FrameButton>
        </div>
        <SecondLogo />
      </div>
      <Modal open={frameContext.isModalOpen}>
        <FrameModalList />
      </Modal>
    </>
  );
}
