import EngineStats from "../engineStats/engineStats";

export default function RightBar() {
  return (
    <div class="flex flex-col justify-start items-center bg-app-bg-2 py-2">
      <EngineStats />
    </div>
  );
}
