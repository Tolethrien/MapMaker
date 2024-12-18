import monke from "@/assets/monke.svg";

export default function SecondLogo() {
  return (
    <div class="flex items-center">
      <img src={monke} alt="logo" class="h-[28px]"></img>
      <h1 class="whitespace-nowrap text-ellipsis">Level Editor</h1>
      <img src={monke} alt="logo" class="h-[28px] transform scale-x-[-1]"></img>
    </div>
  );
}
