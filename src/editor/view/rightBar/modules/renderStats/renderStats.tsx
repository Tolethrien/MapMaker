import { createEffect, createSignal } from "solid-js";
import RenderStatsConnector, {
  RENDERER_START_DATA,
  RenderStatsData,
} from "./connector";
import ModuleSection from "@/editor/components/module/ModuleSection";
import ModuleFrame from "@/editor/components/module/moduleFrame";

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
    <ModuleFrame
      title="Render"
      pinnedComponent={
        <div class="relative w-full h-8">
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
      }
    >
      <ModuleSection title="Time">
        <p class="text-center">Frame time: {renderData().frameTime}ms</p>
        <div class="flex justify-around">
          <p class="text-center">CPU time: {renderData().CPUTime}ms</p>
          <p class="text-center">GPU time: {renderData().GPUTime}ms</p>
        </div>
      </ModuleSection>
      <ModuleSection title="Game" open={false}>
        <div class="flex justify-around">
          <p>QuadCount: {renderData().quadsCount}</p>
          <p>LightsCount: {renderData().lightsCount}</p>
        </div>

        <div class="flex justify-around">
          <p>QuadsLimit: {renderData().quadsLimit}</p>
          <p>LightsLimit: {renderData().lightsLimit}</p>
        </div>
      </ModuleSection>
      <ModuleSection title="Renderer" open={false}>
        <div class="flex justify-around">
          <p>DrawCalls: {renderData().drawCalls}</p>
          <p>ComputeCalls: {renderData().computeCalls}</p>
        </div>
        <div class="flex justify-around">
          <p>Bloom: {renderData().bloom ? "Active" : "Inactive"}</p>
          <p>BloomSTR: {renderData().bloomStr}</p>
        </div>
        <div class="flex justify-around">
          <p>PostEffect: {renderData().postProcess}</p>
          <p>PostEffectSTR: {renderData().postProcessStr}</p>
        </div>
        <div class="flex justify-around">
          <p>
            Illumination: {renderData().illumination ? "Active" : "Inactive"}
          </p>
          <p>
            ColorCorr:{" "}
            {`R:${renderData().colorCorr[0]}|G:${renderData().colorCorr[1]}|B:${
              renderData().colorCorr[2]
            }`}
          </p>
        </div>

        <br />
        <p>Camera: {renderData().camera}</p>
        <p>Stats Refresh rate: {renderData().refreshRate}s</p>
      </ModuleSection>
    </ModuleFrame>
  );
}
