import Engine from "@/engine/engine";
import { createEffect } from "solid-js";

export default function Canvas() {
  let canvasRef: HTMLCanvasElement | undefined;

  createEffect(() => {
    if (canvasRef) {
      const ctx = canvasRef.getContext("2d");
      if (!canvasRef || !ctx) throw new Error(`No canvas found`);
      Engine.initialize(canvasRef);
    }
  });

  return (
    <div class="flex flex-grow w-fit justify-center ">
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        class="border border-black w-[600px] h-[600px]"
      />
    </div>
  );
}
