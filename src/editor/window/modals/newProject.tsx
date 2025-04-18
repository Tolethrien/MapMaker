import { batch, createEffect, createSignal, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import Button from "@/editor/components/button";
import { FrameContext } from "@/editor/providers/frame";
import { getAPI } from "@/preload/getAPI";
import { createNewProject, NewProjectProps } from "@/utils/projectUtils";
import ArrowSVG from "@/assets/icons/sizeArrows";
import Input from "@/editor/components/input";
import NameSVG from "@/assets/icons/name";
import FolderSVG from "@/assets/icons/folder";
import IconButton from "@/editor/components/buttonAsIcon";
import PickerSVG from "@/assets/icons/picker";
import CloseSVG from "@/assets/icons/close";
import { sendNotification } from "@/utils/utils";

const { getPathTo, joinPath } = getAPI("utils");
const { openFolderPicker } = getAPI("dialog");
const { addToRecent } = getAPI("settings");

export default function NewProject() {
  const context = useContext(FrameContext)!;
  const [isLoading, setIsLoading] = createSignal(false);
  const [state, setState] = createStore<NewProjectProps>({
    dirPath: "C:\\",
    name: "",
    defaultPath: "",
    tileSize: { w: 32, h: 32 },
    chunkSize: { w: 16, h: 16 },
  });

  createEffect(async () => {
    const path = await getPathTo("desktop");
    if (path === "") {
      sendNotification({
        type: "error",
        value: "No project path? this should be imposable",
      });
      return;
    }
    batch(() => {
      setState("dirPath", path);
      setState("defaultPath", path);
    });
  });

  const setProjectPath = async () => {
    const { canceled, filePaths } = await openFolderPicker();
    if (canceled) return;
    setState("dirPath", filePaths[0]);
  };

  const createProject = async () => {
    if (state.name.length === 0) return;
    setIsLoading(true);
    const projectPath = await joinPath(state.dirPath, state.name);
    const status = await createNewProject(state);
    if (!status.success) {
      sendNotification({ type: "error", value: status.error });
      setIsLoading(false);
      return;
    }
    const recentStatus = await addToRecent({
      name: state.name,
      path: projectPath,
    });
    if (!recentStatus.success)
      sendNotification({ type: "error", value: status.error });
    batch(() => {
      setIsLoading(false);
      setState("name", "");
      setState("dirPath", state.defaultPath);
      context.setModalOpen(false);
    });
  };
  return (
    <div class="px-12 py-8 bg-app-main-2 text-app-acc-wheat  flex flex-col gap-4">
      <button
        class="bg-app-acc-red text-app-acc-wheat rounded-sm absolute top-0 right-0"
        onclick={() => context.setModalOpen(false)}
      >
        <CloseSVG style="h-3 w-3 my-2 mx-3" />
      </button>
      <p class="text-3xl font-bold text-center">New Project!</p>
      <div class="flex flex-col gap-4">
        <p class="text-2xl font-bold text-app-acc-red text-center">General</p>
        <div class="flex items-center">
          <NameSVG style="w-5 h-5" />
          <label class="text-xl">
            <span class="pr-4 pl-2">Name:</span>
            <Input
              onInput={(e) => setState("name", e.target.value)}
              placeholder="project..."
              value={state.name}
            />
          </label>
        </div>
        <div class="flex items-center">
          <FolderSVG style="w-5 h-5" />
          <label class="text-xl">
            <span class="pr-4 pl-2">Path:</span>
            <Input
              placeholder="C\\..."
              value={`${state.dirPath}\\${state.name}`}
              type="selector"
            />
            <IconButton onClick={setProjectPath}>
              <PickerSVG style="w-5 h-5 ml-2 translate-y-3" />
            </IconButton>
          </label>
        </div>
      </div>
      <div class="py-6">
        <p class="text-2xl font-bold text-app-acc-red text-center pb-2">
          Sizing
        </p>
        <div class="flex w-full justify-around pb-4">
          <p class="text-center text-2xl flex flex-col">
            Tile
            <span class="text-xs">(in pixels)</span>
          </p>
          <p class="text-center text-2xl flex flex-col">
            Chunk
            <span class="text-xs">(in tiles)</span>
          </p>
        </div>
        <div class="flex justify-around">
          <div class="relative">
            <input
              class="absolute text-right top-1/2 -translate-y-1/2 right-full w-8 bg-transparent border-b-2 border-app-acc-wheat outline-none"
              value={state.tileSize.w}
              onInput={(e) => setState("tileSize", "w", Number(e.target.value))}
            />
            <ArrowSVG style="w-20 h-20 fill-app-acc-red" />
            <div class="w-10 h-10 bg-slate-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            <input
              class="absolute text-center top-full -translate-x-1/2 left-1/2 w-10 bg-transparent border-b-2 border-app-acc-wheat outline-none"
              value={state.tileSize.h}
              onInput={(e) => setState("tileSize", "h", Number(e.target.value))}
            />
          </div>
          <div class="relative">
            <input
              class="absolute text-right top-1/2 -translate-y-1/2 right-full w-8 bg-transparent border-b-2 border-app-acc-wheat outline-none"
              value={state.chunkSize.w}
              onInput={(e) =>
                setState("chunkSize", "w", Number(e.target.value))
              }
            />
            <ArrowSVG style="w-20 h-20 fill-app-acc-red" />
            <div class="w-10 h-10 bg-slate-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            <input
              class="absolute text-center top-full -translate-x-1/2 left-1/2 w-10 bg-transparent border-b-2 border-app-acc-wheat outline-none"
              value={state.chunkSize.h}
              onInput={(e) =>
                setState("chunkSize", "h", Number(e.target.value))
              }
            />
          </div>
        </div>
      </div>
      <Button
        name="Confirm"
        onClick={createProject}
        loading={isLoading}
        style="mt-6"
      ></Button>
    </div>
  );
}
