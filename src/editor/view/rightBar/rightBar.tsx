import RenderStats from "@/editor/view/rightBar/modules/renderStats/renderStats";
import TextureView from "@/editor/view/rightBar/modules/textureView/textureView";

export default function RightBar() {
  return (
    <div class="col-span-3 flex flex-col justify-start items-center bg-app-main-2 py-2 border-l-2 border-app-acc-gray">
      <RenderStats />
      <TextureView />
    </div>
  );
}
