import { batch, createEffect, createSignal, useContext } from "solid-js";
import Button from "@editor/components/reusable/button";
import { FrameContext } from "@editor/components/frame/context/provider";
import { getAPI } from "@/preload/getAPI";
import { openProject } from "@/API/project";

export default function NewProject() {
  const context = useContext(FrameContext);

  const [path, setPath] = createSignal("C:\\");
  const [defPath, setDefPath] = createSignal("C:\\");
  const [isLoading, setIsLoading] = createSignal(false);

  createEffect(async () => {
    const { getAppPath } = getAPI("API_FILE_SYSTEM");
    const { success, path, error } = await getAppPath();
    if (!success) {
      console.error(error);
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
      console.error(status.error);
      setIsLoading(false);
      return;
    }
    setPath(defPath());
    setIsLoading(false);
    context.setModalOpen(false);
  };

  return (
    <div class="px-4 py-4 bg-main-1 text-wheat flex flex-col gap-4">
      <p class="text-3xl font-bold text-center">Open Project!</p>
      <div class="flex gap-4">
        <div class="h-full bg-main-3">
          <p class="text-center">Recent</p>
          <div class="w-48 h-64 p-1 overflow-y-auto flex gap-2 flex-col">
            <div
              class="w-full cursor-pointer"
              onClick={() => {
                setPath("C:\\Users\\Tolet\\Desktop\\3");
                onOpenProject();
              }}
            >
              Lazarus
            </div>
            <div class="w-full">Shock</div>
          </div>
        </div>
        <div class="flex flex-col justify-between">
          <label class="text-xl flex gap-4">
            Path:
            <input
              class="border-b-main-4 bg-main-3 border-b-1 rounded-sm"
              placeholder="C\\..."
              value={path()}
            ></input>
            <button onClick={setProjectPath}>...</button>
          </label>
          <Button
            name="Confirm"
            onClick={onOpenProject}
            loading={isLoading}
          ></Button>
        </div>
      </div>
      <button
        class=" bg-main-acc-1 text-wheat px-3 rounded-sm absolute top-0 right-0"
        onclick={() => context.setModalOpen(false)}
      >
        X
      </button>
    </div>
  );
}
