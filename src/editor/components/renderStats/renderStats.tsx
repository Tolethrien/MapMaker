import { createEffect, createSignal } from "solid-js";
import RenderStatsConnector, {
  RENDERER_START_DATA,
  RenderStatsData,
} from "./connector";

export default function RenderStats() {
  let canvasRef!: HTMLCanvasElement;
  const [renderData, setRenderData] = createSignal<RenderStatsData>(
    structuredClone(RENDERER_START_DATA as RenderStatsData),
    { equals: false }
  );

  createEffect(() => {
    if (canvasRef) {
      RenderStatsConnector.connectToComponent({
        canvas: canvasRef,
        dataSetter: setRenderData,
      });
    }
  });
  return (
    <div class="shadow-lg w-full">
      <p class="text-center bg-app-bg-4 w-full text-app-acc-red font-semibold text-lg">
        Render Stats
      </p>
      <div class="overflow-y-auto max-h-80  border-2 border-app-bg-4 shadow-inner p-1 text-app-acc-wheat">
        <div class="border-b-1 border-app-bg-4 py-2">
          <p class="text-center bg-app-bg-4 w-full">Frame</p>
          <div class="relative w-full h-8 my-2">
            <canvas
              ref={canvasRef}
              class="bg-black absolute top-0 left-0 w-full h-[32px]"
              width="190"
              height="32"
            ></canvas>
            <p class="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-app-acc-wheat font-medium">
              FPS: {renderData().FPS}
            </p>
          </div>
          <p class="framer_slot">Frame time: {renderData().frameTime}ms</p>
          <p class="framer_slot">CPU time: {renderData().CPUTime}ms</p>
          <p class="framer_slot">GPU time: {renderData().GPUTime}ms</p>
        </div>

        <div class="border-b-1 border-app-bg-4 py-2">
          <p class="text-center bg-app-bg-4 w-full mb-2">Game Data</p>
          <p class="framer_slot">QuadCount: {renderData().quadsCount}</p>
          <p class="framer_slot">QuadsLimit: {renderData().quadsLimit}</p>
          <p class="framer_slot">LightsCount: {renderData().lightsCount}</p>
          <p class="framer_slot">LightsLimit: {renderData().lightsLimit}</p>
        </div>
        <div class="py-2">
          <p class="text-center bg-app-bg-4 w-full mb-2">Render Data</p>
          <p class="framer_slot">DrawCalls: {renderData().drawCalls}</p>
          <p class="framer_slot">ComputeCalls: {renderData().computeCalls}</p>
          <p class="framer_slot">
            Bloom: {renderData().bloom ? "Active" : "Inactive"}
          </p>
          <p class="framer_slot">BloomSTR: {renderData().bloomStr}</p>
          <p class="framer_slot">
            Illumination: {renderData().illumination ? "Active" : "Inactive"}
          </p>
          <p class="framer_slot">PostEffect: {renderData().postProcess}</p>
          <p class="framer_slot">
            PostEffectSTR: {renderData().postProcessStr}
          </p>
          <p class="framer_slot">
            ColorCorr:{" "}
            {`R:${renderData().colorCorr[0]}|G:${renderData().colorCorr[1]}|B:${
              renderData().colorCorr[2]
            }`}
          </p>
          <p class="framer_slot">Camera: {renderData().camera}</p>
          <p class="framer_slot">
            Stats Refresh rate: {renderData().refreshRate}s
          </p>
        </div>
      </div>
    </div>
  );
}
