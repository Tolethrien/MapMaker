import ModuleList from "./moduleList";
import RenderStats from "./modules/renderStats/renderStats";
import TextureView from "./modules/textureView/textureView";

export default function RightBar() {
  return (
    <div class="flex-[3] flex flex-col bg-app-main-2 border-l-2 border-app-acc-gray overflow-y-auto">
      <ModuleList position="Top" />
      <div class="w-full flex-grow overflow-y-auto flex flex-col gap-4 pt-2">
        <RenderStats />
        <TextureView />
      </div>
    </div>
  );
}
