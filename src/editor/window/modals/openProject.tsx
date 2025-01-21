import { batch, createEffect, createSignal, For, useContext } from "solid-js";
import Button from "@/editor/components/button";
import { FrameContext } from "@/editor/providers/frame";
import { getAPI } from "@/preload/api/getAPI";

import { openProject } from "@/preload/api/project";
import FolderSVG from "@/assets/icons/folder";
import Input from "@/editor/components/input";
import IconButton from "@/editor/components/buttonAsIcon";
import PickerSVG from "@/assets/icons/picker";
import CloseSVG from "@/assets/icons/close";
import TrashSVG from "@/assets/icons/trash";
import { sendNotification } from "@/utils/utils";

export default function NewProject() {
  const context = useContext(FrameContext)!;

  const [path, setPath] = createSignal("C:\\");
  const [defPath, setDefPath] = createSignal("C:\\");
  const [isLoading, setIsLoading] = createSignal(false);

  createEffect(async () => {
    const { getAppPath } = getAPI("API_FILE_SYSTEM");
    const path = await getAppPath("app");
    if (path === "") {
      sendNotification({
        type: "error",
        value: "No project path? this should be imposable",
      });
      return;
    }
    batch(() => {
      setPath(path);
      setDefPath(path);
    });
  });

  const setProjectPath = async () => {
    const { openFolderPicker } = getAPI("API_DIALOG");
    const { canceled, filePaths } = await openFolderPicker();
    if (canceled) return;
    setPath(filePaths[0]);
  };

  const onOpenProject = async () => {
    setIsLoading(true);
    const status = await openProject(path());
    if (!status.success) {
      sendNotification({ type: "error", value: status.error });
      setIsLoading(false);
      return;
    }
    setPath(defPath());
    setIsLoading(false);
    context.setModalOpen(false);
  };

  return (
    <div class="px-4 py-4 bg-app-main-2 text-app-acc-wheat grid grid-cols-10">
      <button
        class="bg-app-acc-red text-app-acc-wheat rounded-sm absolute top-0 right-0"
        onclick={() => context.setModalOpen(false)}
      >
        <CloseSVG style="h-3 w-3 my-2 mx-3" />
      </button>
      <div class="bg-app-main-3 border-2 border-app-acc-gray h-96 w-72 col-span-4 flex flex-col ">
        <p class="text-center text-2xl font-medium py-2 border-b-1 border-app-acc-gray shadow-md">
          Recent
        </p>
        <div class="flex flex-col items-center gap-2 overflow-y-auto h-full py-2">
          <For each={[0]}>
            {() => (
              <div class="grid grid-cols-10 items-center justify-items-center bg-app-main-2 rounded-md border-2 border-app-acc-gray py-2 w-[96%] hover:brightness-125 shadow-lg">
                <FolderSVG style="w-5 h-5 col-span-2" />
                <p
                  class="col-span-6 justify-self-start border-r-2 w-full border-app-acc-gray"
                  onDblClick={() => {
                    setPath("C:\\Users\\Tolet\\Desktop\\3");
                    onOpenProject();
                  }}
                >
                  Lazarus
                </p>
                <IconButton onClick={() => {}} style="col-span-2">
                  <TrashSVG style="w-5 h-5" />
                </IconButton>
              </div>
            )}
          </For>
        </div>
      </div>
      <div class="col-span-6 flex flex-col items-center">
        <p class="text-3xl font-bold text-center py-2">Open Project!</p>
        <div class="flex flex-grow items-start">
          <div class="flex items-center mt-14">
            <FolderSVG style="w-5 h-5" />
            <label class="text-xl">
              <span class="pr-4 pl-2">Path:</span>
              <Input placeholder="C\\..." value={path()} type="selector" />
              <IconButton onClick={setProjectPath}>
                <PickerSVG style="w-5 h-5 ml-2 translate-y-3" />
              </IconButton>
            </label>
          </div>
        </div>
        <Button
          name="Confirm"
          onClick={onOpenProject}
          loading={isLoading}
          disabled={isLoading}
          style="w-3/4"
        ></Button>
      </div>
    </div>
  );
}
