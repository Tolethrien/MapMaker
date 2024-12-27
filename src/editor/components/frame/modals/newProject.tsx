import { batch, createEffect, createSignal, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import Button from "@editor/components/reusable/button";
import { FrameContext } from "@editor/components/frame/context/provider";
import { getAPI } from "@/preload/getAPI";
import { createNewProject, NewProjectProps } from "@/API/project";
import arrows from "@/assets/arrows.svg";
export default function NewProject() {
  const context = useContext(FrameContext);
  const [isLoading, setIsLoading] = createSignal(false);

  const [state, setState] = createStore<NewProjectProps>({
    dirPath: "C:\\",
    name: "",
    defaultPath: "",
    tileSize: { w: 32, h: 32 },
    chunkSize: { w: 16, h: 16 },
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
      setState("dirPath", path);
      setState("defaultPath", path);
    });
  });

  const setProjectPath = async () => {
    const { openFolderPicker } = getAPI("API_DIALOG");
    const { canceled, filePaths } = await openFolderPicker();
    if (canceled) return;
    setState("dirPath", filePaths[0]);
  };

  const createProject = async () => {
    if (state.name.length === 0) return;
    setIsLoading(true);
    const status = await createNewProject(state);
    if (!status.success) {
      console.error(status.error);
      setIsLoading(true);
      return;
    }
    batch(() => {
      setIsLoading(false);
      setState("name", "");
      setState("dirPath", state.defaultPath);
      context.setModalOpen(false);
    });
  };

  const setSize = (
    type: "chunkSize" | "tileSize",
    axis: "w" | "h",
    value: number
  ) => {
    const size =
      axis === "w"
        ? { w: value, h: state[type].h }
        : { w: state[type].w, h: value };
    setState(type, size);
  };
  return (
    <div class="px-16 py-8 bg-main-1 text-wheat flex flex-col gap-4">
      <p class="text-3xl font-bold text-center">New Project!</p>
      <div class="flex flex-col gap-4">
        <p class="text-2xl font-bold text-main-acc-1 text-center">General</p>
        <label class="text-xl">
          Name:
          <input
            class="border-b-main-4 bg-main-3 border-b-1 rounded-sm ml-4"
            placeholder="project..."
            value={state.name}
            onInput={(e) => setState("name", e.target.value)}
          ></input>
        </label>
        <label class="text-xl flex gap-4">
          Path:
          <input
            class="border-b-main-4 bg-main-3 border-b-1 rounded-sm"
            placeholder="C\\..."
            value={`${state.dirPath}\\${state.name}`}
          ></input>
          <button onClick={setProjectPath}>...</button>
        </label>
        <div class="text-xl flex gap-4 items-center">
          Auto-save:
          <input
            type="checkbox"
            class="border-b-main-4 w-5 h-5 bg-main-3 border-b-1 checked:bg-red-500"
            checked={state.autosave}
            onChange={(e) => setState("autosave", e.target.checked)}
          ></input>
        </div>
      </div>
      <div>
        <p class="text-2xl font-bold text-main-acc-1 text-center">Sizing</p>
        <div class="flex justify-between">
          <div>
            <p class="text-center text-lg">Tile(in px)</p>
            <div class="relative flex flex-col items-center">
              <div class="relative">
                <img src={arrows} class="w-20 h-20"></img>
                <div class="w-10 h-10 bg-slate-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <input
                class="absolute top-1/2 -translate-y-[125%] right-full w-12 text-center  border-b-1 border-b-wheat bg-transparent"
                value={state.tileSize.w}
                onInput={(e) =>
                  setSize("tileSize", "w", Number(e.target.value))
                }
              ></input>
              <input
                class="border-b-1 border-b-wheat bg-transparent w-12 text-center"
                value={state.tileSize.h}
                onInput={(e) =>
                  setSize("tileSize", "h", Number(e.target.value))
                }
              ></input>
            </div>
          </div>
          <div>
            <p class="text-center text-lg">Chunk</p>
            <div class="relative flex flex-col items-center">
              <div class="relative">
                <img src={arrows} class="w-20 h-20"></img>
                <div class="w-10 h-10 bg-slate-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <input
                class="absolute top-1/2 -translate-y-[125%] right-full w-12 text-center  border-b-1 border-b-wheat bg-transparent"
                value={state.chunkSize.w}
                onInput={(e) =>
                  setSize("chunkSize", "w", Number(e.target.value))
                }
              ></input>
              <input
                class="border-b-1 border-b-wheat bg-transparent w-12 text-center"
                value={state.chunkSize.h}
                onInput={(e) =>
                  setSize("chunkSize", "h", Number(e.target.value))
                }
              ></input>
            </div>
          </div>
        </div>
      </div>
      <button
        class=" bg-main-acc-1 text-wheat px-3 rounded-sm absolute top-0 right-0"
        onclick={() => context.setModalOpen(false)}
      >
        X
      </button>
      <Button
        name="Confirm"
        onClick={createProject}
        loading={isLoading}
      ></Button>
    </div>
  );
}
