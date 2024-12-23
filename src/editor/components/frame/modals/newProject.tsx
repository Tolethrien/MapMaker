import { batch, createEffect, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import Button from "@editor/components/reusable/button";
import { FrameContext } from "../context/provider";
import { getAPI } from "@/preload/getAPI";
import { createNewProject, NewProjectProps } from "@/API/project";

export default function NewProject() {
  const context = useContext(FrameContext);

  const [state, setState] = createStore<NewProjectProps>({
    dirPath: "C:\\",
    name: "",
    defaultPath: "",
    tileSize: { w: 32, h: 32 },
    chunkSize: { w: 16, h: 16 },
    infinite: false,
    autosave: false,
  });

  createEffect(async () => {
    const { getAppPath } = getAPI("API_FILE_SYSTEM");
    const { success, path, error } = await getAppPath();
    if (!success) {
      console.error(error);
      return;
    }
    batch(() => {
      const shortened = validatePathSize(path);
      setState("dirPath", shortened);
      setState("defaultPath", shortened);
    });
  });

  const setProjectPath = async () => {
    const { openFolderPicker } = getAPI("API_DIALOG");
    const { canceled, filePaths } = await openFolderPicker();
    if (canceled) return;
    const path = validatePathSize(filePaths[0]);
    setState("dirPath", path);
  };

  const createProject = async () => {
    if (state.name.length === 0) return;
    const status = await createNewProject(state);
    if (!status.success) {
      console.error(status.error);
      return;
    }
    setState("name", "");
    setState("dirPath", state.defaultPath);
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
        <p class="min-w-40">Path: {`${state.dirPath}\\${state.name}`}</p>
        <button class="border-2 border-black px-2" onClick={setProjectPath}>
          ...
        </button>
      </div>
      <div class="flex gap-4">
        <p>infinite Map?</p>
        <input
          type="checkbox"
          checked={state.infinite}
          class="w-4"
          onChange={(e) => setState("infinite", e.target.checked)}
        />
      </div>
      <div class="flex gap-4">
        <p>AutoSave?</p>
        <input
          type="checkbox"
          checked={state.autosave}
          class="w-4"
          onChange={(e) => setState("autosave", e.target.checked)}
        />
      </div>
      <div class="flex gap-4">
        <p>Tile Size</p>
        <input
          type="number"
          class="w-8 bg-white bg-opacity-10 border-2 border-black focus:outline-none"
          onInput={(e) =>
            setState("tileSize", {
              w: Number(e.target.value),
              h: state.tileSize.h,
            })
          }
        />
        /
        <input
          type="number"
          class="w-8 bg-white bg-opacity-10 border-2 border-black focus:outline-none"
          onInput={(e) =>
            setState("tileSize", {
              w: state.tileSize.w,
              h: Number(e.target.value),
            })
          }
        />
        px
      </div>
      <div class="flex gap-4">
        <p>ChunkSize</p>
        <input
          type="number"
          class="w-8 bg-white bg-opacity-10 border-2 border-black focus:outline-none"
          onInput={(e) =>
            setState("chunkSize", {
              w: Number(e.target.value),
              h: state.chunkSize.h,
            })
          }
        />
        /
        <input
          type="number"
          class="w-8 bg-white bg-opacity-10 border-2 border-black focus:outline-none"
          onInput={(e) =>
            setState("chunkSize", {
              w: state.chunkSize.w,
              h: Number(e.target.value),
            })
          }
        />
        tiles
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
