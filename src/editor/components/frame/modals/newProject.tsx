import { useContext } from "solid-js";
import { createStore } from "solid-js/store";
import Button from "@editor/components/reusable/button";
import { FrameContext } from "../context/provider";
import { getAPI } from "@/preload/getAPI";

interface ProjectStore {
  path: string;
  name: string;
}

export default function NewProject() {
  const context = useContext(FrameContext);

  const [state, setState] = createStore<ProjectStore>({
    path: "C:\\",
    name: "",
  });

  const setProjectPath = async () => {
    const { openFolderPicker } = getAPI("API_DIALOG");
    const { canceled, filePaths } = await openFolderPicker();
    if (canceled) return;
    const path = validatePathSize(filePaths[0]);
    setState("path", `${path}\\${state.name}`);
  };

  const createProject = async () => {
    if (state.path === "C:\\" || state.name.length === 0) return;
    const { createFolder } = getAPI("API_FILE_SYSTEM");
    await createFolder(state.path);
    setState("name", "");
    setState("path", "C:\\");
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
    <div class="p-6 relative bg-slate-400">
      <p class="text-lg font-bold">Start you new Project!</p>
      <div class="flex my-2">
        <p class="pr-4">Project Name:</p>
        <input
          placeholder="new"
          value={state.name}
          onInput={(e) => setState("name", e.target.value)}
        ></input>
      </div>
      <div class="flex my-2 gap-4">
        <p class="min-w-40">Path: {state.path}</p>
        <button
          disabled={state.name.length === 0}
          class="border-2 border-black px-2"
          onClick={setProjectPath}
        >
          ...
        </button>
      </div>
      <button
        class=" bg-slate-600 text-white px-3 rounded-sm absolute top-0 right-0"
        onclick={() => context.setModalOpen(false)}
      >
        X
      </button>
      <Button name="Confirm" onClick={createProject}></Button>
    </div>
  );
}
