import { useContext } from "solid-js";
import Button from "../../reusable/button";
import { FrameContext } from "../context/provider";
import { getAPI } from "@/preload/getAPI";

export default function CloseApp() {
  const context = useContext(FrameContext);
  const { appTerminate } = getAPI("API_APP");

  return (
    <div class="bg-main-2 p-12 flex gap-8">
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
  );
}
