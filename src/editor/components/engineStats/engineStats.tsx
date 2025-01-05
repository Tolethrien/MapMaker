import EventBus from "@/engine/core/modules/eventBus/eventBus";
import { clamp, mapRange } from "@/utils/utils";
import { batch, createEffect, createSignal } from "solid-js";
const REFRESH_RATE = 1;
const SAVED_FRAMES = 60;
const BAR_WIDTH = 3;
const MAX_BAR_HEIGHT = 30;
const BAR_GAP = 0.1;
export default function EngineStats() {
  let ctx!: CanvasRenderingContext2D;
  let canvasRef!: HTMLCanvasElement;
  const [frames, setFrames] = createSignal<number[][]>([], { equals: false });
  const [fps, setFps] = createSignal<number>(0);
  EventBus.on("updateStats", {
    name: "updateUI",
    callback: (e: number[][]) => {
      batch(() => {
        setFps(e.reduce((acc, frame) => acc + frame[0], 0) / SAVED_FRAMES);
        setFrames(e);
        updateCanvas();
      });
    },
  });

  const updateCanvas = () => {
    ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
    frames().forEach((frame, index) => {
      const value = mapRange(
        clamp(frame[0], 0, 600),
        0,
        600,
        0,
        MAX_BAR_HEIGHT
      );
      const color = colorLerp(value, MAX_BAR_HEIGHT);
      ctx.fillStyle = color;
      ctx.fillRect(
        canvasRef.width - BAR_WIDTH - index * (BAR_WIDTH + BAR_GAP),
        canvasRef.height,
        BAR_WIDTH,
        -value
      );
    });
  };

  const colorLerp = (value: number, maxValue: number) => {
    const normalizedValue = Math.min(Math.max(value / maxValue, 0), 1);
    const r = Math.floor(255 * (1 - normalizedValue));
    const g = Math.floor(255 * normalizedValue);
    const b = 0;
    return `rgb(${r},${g},${b})`;
  };
  createEffect(() => {
    if (canvasRef) ctx = canvasRef.getContext("2d")!;
  });
  return (
    <div class="shadow-lg">
      <p class="text-center bg-app-bg-4 w-full text-app-acc-red font-semibold text-lg">
        Render Stats
      </p>
      <div class="w-52 max-h-80 overflow-y-auto  border-2 border-app-bg-4 shadow-inner p-1 text-app-acc-wheat">
        <div class="border-b-1 border-app-bg-4 py-2">
          <p class="text-center bg-app-bg-4 w-full">Frame</p>
          <div class="relative w-full h-8 my-2">
            <canvas
              ref={canvasRef}
              class="bg-black absolute top-0 left-0"
              width="190"
              height="32"
            ></canvas>
            <p class="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-app-acc-red font-medium">
              FPS: {fps().toFixed(1)}
            </p>
          </div>
          <p class="framer_slot">Frame time: 0.0ms</p>
          <p class="framer_slot">CPU time: 0.0ms</p>
          <p class="framer_slot">GPU time: 0.0ms</p>
        </div>

        <div class="border-b-1 border-app-bg-4 py-2">
          <p class="text-center bg-app-bg-4 w-full mb-2">Game Data</p>
          <p class="framer_slot">QuadCount: 0</p>
          <p class="framer_slot">QuadsLimit: 0</p>
          <p class="framer_slot">LightsCount: 0</p>
          <p class="framer_slot">LightsLimit: 0</p>
        </div>
        <div class="py-2">
          <p class="text-center bg-app-bg-4 w-full mb-2">Render Data</p>
          <p class="framer_slot">blooming: 0</p>
          <p class="framer_slot">bloomSTR: 0</p>
          <p class="framer_slot">lighting: 0</p>
          <p class="framer_slot">globalEffect: 0</p>
          <p class="framer_slot">globalEffectSTR: 0</p>
          <p class="framer_slot">colorCorrection: 0</p>
          <p class="framer_slot">camera: custom</p>
          <p class="framer_slot">drawCalls: 0</p>
          <p class="framer_slot">computeCalls: 0</p>
          <p class="framer_slot">Stats Refresh rate: 1s</p>
        </div>
      </div>
    </div>
  );
}
