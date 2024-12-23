import Engine from "@/engine/engine";
import Tile from "@/engine/sandbox/entities/tile";
import { getTilePosition } from "@/utils/chunk";
import { createEffect } from "solid-js";

export default function Canvas() {
  let ref!: HTMLCanvasElement;
  createEffect(async () => {
    if (ref !== undefined) {
      console.log(ref);
      await Engine.initialize(ref);
    }
    const data: number[] = Array(30)
      .fill(null)
      .map((_, i) => i);
    data.forEach((chunk) => {
      const tilePos = getTilePosition({
        chunkPos: { x: 50, y: 50 },
        chunkSize: { w: 10, h: 3 },
        tileIndex: chunk,
        tileSize: { w: 32, h: 32 },
      });
      const tile = new Tile({
        pos: tilePos,
        size: { h: 32, w: 32 },
      });
      Engine.addEntity(tile);
    });
  });
  return (
    <div class="flex flex-grow w-fit justify-center ">
      <canvas
        ref={ref}
        id="editorCanvas"
        width={600}
        height={600}
        class="border border-black w-[600px] h-[600px]"
      />
    </div>
  );
}
