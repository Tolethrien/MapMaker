import { batch, createEffect, createSignal, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import Button from "@editor/components/reusable/button";
import { FrameContext } from "../context/provider";
import { getAPI } from "@/preload/getAPI";
import { openProject } from "@/API/project";
import { joinPaths } from "@/utils/utils";

export default function NewProject() {
  const context = useContext(FrameContext);

  const [path, setPath] = createSignal("C:\\");
  const [defPath, setDefPath] = createSignal("C:\\");

  createEffect(async () => {
    const { getAppPath } = getAPI("API_FILE_SYSTEM");
    const { success, path, error } = await getAppPath();
    if (!success) {
      console.error(error);
      return;
    }
    batch(() => {
      const shortened = validatePathSize(path);
      setPath(shortened);
      setDefPath(shortened);
    });
  });

  const setProjectPath = async () => {
    const { openFolderPicker } = getAPI("API_DIALOG");
    const { canceled, filePaths } = await openFolderPicker();
    if (canceled) return;
    const path = validatePathSize(filePaths[0]);
    setPath(path);
  };

  const onOpenProject = async () => {
    const status = await openProject(path());
    if (!status.success) {
      console.error(status.error);
      return;
    }
    setPath(defPath());
    context.setModalOpen(false);
  };
  const validatePathSize = (path: string) => {
    if (path.length === 3) return path.slice(0, 2); //partition returns with "\" so will have "\\". Cutting excess
    if (path.length < 30) return path;
    const splitted = path.split("\\");
    const filtered = splitted.filter(
      (_, index) => index === 0 || index === 1 || index === splitted.length - 1
    );
    filtered.splice(2, 0, "...");
    return filtered.join("\\");
  };

  return (
    <div class="p-6 relative bg-slate-400 flex">
      <div class="w-1/3">
        <p>Recent</p>
        <div></div>
      </div>
      <div>
        <p class="text-lg font-bold whitespace-nowrap px-4">Open Project!</p>
        <div class="flex my-2 gap-4">
          <p class="min-w-40 whitespace-nowrap">Path: {path()}</p>
          <button class="border-2 border-black px-2" onClick={setProjectPath}>
            ...
          </button>
        </div>
        <Button name="Confirm" onClick={onOpenProject}></Button>
      </div>
      <button
        class=" bg-slate-600 text-white px-3 rounded-sm absolute top-0 right-0"
        onclick={() => context.setModalOpen(false)}
      >
        X
      </button>
    </div>
  );
}
