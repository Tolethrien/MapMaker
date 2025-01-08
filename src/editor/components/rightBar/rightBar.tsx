import RenderStats from "../renderStats/renderStats";

export default function RightBar() {
  return (
    <div class="w-64 flex flex-col justify-start items-center bg-app-bg-2 py-2">
      <RenderStats />
    </div>
  );
}
