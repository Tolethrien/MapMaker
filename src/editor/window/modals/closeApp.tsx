import { useContext } from "solid-js";
import { FrameContext } from "../../providers/frame";
import { getAPI } from "@/preload/api/getAPI";

import Button from "@/editor/components/button";

export default function CloseApp() {
  const context = useContext(FrameContext)!;
  const { appTerminate } = getAPI("app");

  return (
    <div class="bg-app-main-2 p-12 flex flex-col gap-8">
      <p class="text-center text-app-acc-wheat text-3xl">Are you sure?</p>
      <div class="flex gap-8">
        <Button
          name="Yes!"
          onClick={() => appTerminate()}
          style="text-2xl text-red-500 hover:scale-110"
        />
        <Button
          name="No!"
          onClick={() => context.setModalOpen(false)}
          style="text-3xl text-green-500 hover:scale-110"
        />
      </div>
    </div>
  );
}
