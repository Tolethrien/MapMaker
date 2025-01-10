import MonkeySVG from "@/assets/icons/monke";

export default function SecondLogo() {
  return (
    <div class="flex items-center">
      <MonkeySVG style="w-[28px] h-[28px] fill-app-acc-ice"></MonkeySVG>
      <h1 class="whitespace-nowrap text-ellipsis">Level Editor</h1>
      <MonkeySVG style="h-[28px] w-[28px] transform scale-x-[-1] fill-app-acc-ice"></MonkeySVG>
    </div>
  );
}
