import monke from "@/assets/monke.svg";
const buttonClass =
  "px-4 bg-slate-600 text-wheat app-prevent-drag outline-none text-sm hover:bg-gray-500";
export default function Frame() {
  return (
    <div class="w-full h-[28px] app-drag text-wheat bg-slate-600 flex items-center justify-between pr-36 gap-4">
      <div class="flex h-full gap-1">
        <button class={buttonClass}>File</button>
        <button class={buttonClass}>Edit</button>
        <button class={buttonClass}>Help</button>
      </div>
      <div class="flex items-center">
        <img src={monke} alt="logo" class="h-[28px]"></img>
        <h1 class="whitespace-nowrap text-ellipsis">Level Editor</h1>
        <img
          src={monke}
          alt="logo"
          class="h-[28px] transform scale-x-[-1]"
        ></img>
      </div>
    </div>
  );
}
