import Batcher from "@/engine/core/aurora/urp/batcher";
import { ScreenEffects } from "@/engine/core/aurora/urp/pipelines/presentationPipeline";
import { clamp, mapRange } from "@/utils/utils";
import { Setter } from "solid-js";

const SAVED_FRAMES = 60;
const BAR_GAP = 0.1;

interface UIConnect {
  canvas: HTMLCanvasElement;
  dataSetter: Setter<RenderStatsData>;
}

interface FrameTable {
  FPS: string;
  frameTime: string;
  CPUTime: string;
  GPUTime: string;
}
interface GameTable {
  quadsCount: number;
  quadsLimit: number;
  lightsCount: number;
  lightsLimit: number;
}
interface RenderTable {
  bloom: boolean;
  bloomStr: number;
  illumination: boolean;
  postProcess: ScreenEffects;
  postProcessStr: number;
  colorCorr: [number, number, number];
  camera: "custom" | "built-in";
  drawCalls: number;
  computeCalls: number;
}
interface Other {
  refreshRate: number;
}
export type RenderStatsData = FrameTable & GameTable & RenderTable & Other;
export const RENDERER_START_DATA: RenderStatsData = {
  lightsCount: 0,
  lightsLimit: 0,
  quadsCount: 0,
  quadsLimit: 0,
  bloom: false,
  bloomStr: 0,
  camera: "built-in",
  colorCorr: [0, 0, 0],
  postProcess: "none",
  postProcessStr: 0,
  illumination: false,
  drawCalls: 0,
  computeCalls: 0,
  CPUTime: "0.0",
  frameTime: "0.0",
  GPUTime: "0.0",
  FPS: "0.0",
  refreshRate: 1,
};
export default class RenderStatsConnector {
  private static renderData: RenderStatsData = structuredClone(
    RENDERER_START_DATA as RenderStatsData
  );
  private static frameTimes: number[][] = [[0, 0]];
  private static currFrame = 0;
  private static cpuTime = 0;
  private static gpuTime = 0;
  private static startTime = 0;
  private static lastFrameTime = 0;
  private static lastStartTime = 0;
  private static swapTime = 0;
  private static canvas: HTMLCanvasElement;
  private static ctx: CanvasRenderingContext2D;
  private static setter: Setter<RenderStatsData>;
  private static refreshRate: number = 1 * 60;
  private static barSize: { w: number; h: number } = { w: 1, h: 1 };
  public static connectToComponent({ canvas, dataSetter }: UIConnect) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.setter = dataSetter;
    this.barSize = {
      w: (canvas.width - (SAVED_FRAMES + 1) * BAR_GAP) / SAVED_FRAMES,
      h: (canvas.height / 10) * 8,
    };
  }
  public static setRefreshInSec(sec: number) {
    //TODO: zmiec to na faktyczne sekundy a nie bound do frameRate
    this.refreshRate = sec * 60;
  }
  public static start() {
    this.startTime = performance.now();
    this.lastFrameTime = (this.startTime - this.lastStartTime) / 1000;
    this.lastStartTime = this.startTime;
  }

  public static swapToGPU() {
    this.swapTime = performance.now();
  }

  public static stop() {
    const stopTime = performance.now();
    this.pushFrameTime();
    this.calculateDeviceTime(stopTime);
    this.updateCanvas();
    if (this.currFrame % this.refreshRate === 0 && this.currFrame !== 0) {
      this.calculateFrameTable();
      this.calculateGameTable();
      this.calculateRenderTable();
      this.setter(this.renderData);
      this.currFrame = 0;
    } else this.currFrame++;
  }

  private static pushFrameTime() {
    if (this.frameTimes.length === SAVED_FRAMES) this.frameTimes.shift();
    this.frameTimes.push([
      Math.floor(1000 / this.lastFrameTime / 100),
      performance.now() - this.startTime,
    ]);
  }
  private static calculateDeviceTime(stopTime: number) {
    this.cpuTime = this.swapTime - this.startTime;
    this.gpuTime = stopTime - this.swapTime;
  }
  private static calculateFrameTable() {
    const fps =
      this.frameTimes.reduce((acc, frame) => acc + frame[0], 0) / SAVED_FRAMES;

    this.renderData.FPS = (fps / 10).toFixed(1);
    this.renderData.frameTime = this.frameTimes.at(-1)![1].toFixed(1);
    this.renderData.CPUTime = this.cpuTime.toFixed(1);
    this.renderData.GPUTime = this.gpuTime.toFixed(1);
  }
  private static calculateGameTable() {
    //TODO: po nowej wersji Aurory zmienic na jakis event system by nie aktualizować ciagle np limitow bo raczej ich sie nie zmienia za czesto
    //TODO: w ogole niech to bedzie brane z batchera po prostu a nie takie przepisywanie do innego obiektu...
    const data = Batcher.getRenderData;
    this.renderData.quadsCount = data.numberOfQuads.total;
    this.renderData.quadsLimit = data.limits.quadsPerFrame;
    this.renderData.lightsCount = data.numberOfLights;
    this.renderData.lightsLimit = data.limits.lightsPerFrame;
  }
  private static calculateRenderTable() {
    const data = Batcher.getRenderData;
    this.renderData.bloom = data.bloom.active;
    this.renderData.bloomStr = data.bloom.str;
    this.renderData.illumination = data.lighting;
    this.renderData.postProcess = data.screenShader.type;
    this.renderData.postProcessStr = data.screenShader.str;
    this.renderData.colorCorr = data.colorCorrection;
    this.renderData.camera = data.customCamera ? "custom" : "built-in";
    this.renderData.drawCalls = data.drawCallsInFrame.render;
    this.renderData.computeCalls = data.drawCallsInFrame.compute;
  }

  private static updateCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.frameTimes.forEach((frame, index) => {
      const value = mapRange(
        clamp(frame[0], 0, 600), //600 => 60FPS
        0,
        600,
        0,
        this.barSize.h
      );
      const color = this.colorLerp(value, this.barSize.h);
      this.ctx.fillStyle = color;
      this.ctx.fillRect(
        this.canvas.width - (BAR_GAP + index * (this.barSize.w + BAR_GAP)),
        this.canvas.height,
        this.barSize.w,
        -value
      );
    });
  }

  private static colorLerp(value: number, maxValue: number) {
    const normalizedValue = Math.min(Math.max(value / maxValue, 0), 1);
    const r = 100;
    const g = 0;
    const b = Math.floor(255 * normalizedValue);
    return `rgb(${r},${g},${b})`;
  }
}
