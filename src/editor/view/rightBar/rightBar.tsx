import RenderStats from "@/editor/components/modules/renderStats/renderStats";
import TextureView from "@/editor/components/modules/textureView/textureView";

export default function RightBar() {
  return (
    <div class="w-1/4 flex flex-col justify-start items-center bg-app-bg-2 py-2">
      <RenderStats />
      <TextureView />
    </div>
  );
}
