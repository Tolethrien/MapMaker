import { clamp, mapRange } from "@/utils/utils";
import EventBus from "../../eventBus/eventBus";

const REFRESH_RATE = 1;
const SAVED_FRAMES = 60;
const BAR_WIDTH = 1.6;
const MAX_BAR_HEIGHT = 15;
const BAR_GAP = 0.1;

interface GameData {
  quadsCurrent: number;
  quadsLimit: number;
  lightCurrent: number;
  lightsLimit: number;
  blooming: boolean;
  globalEffect:
    | "sepia"
    | "invert"
    | "vignette"
    | "chromaticAbber"
    | "grayscale"
    | "none"
    | "noice";
  globalEffectStr: number;
  bloomStr: number;
  lighting: boolean;
  colorCorr: [number, number, number];
  camera: "custom" | "built-in";
  drawCalls: number;
  computeCalls: number;
}

const HTML = {
  frameTime: 0,
  cpuTime: 1,
  gpuTime: 2,
  quadCount: 4,
  quadLimit: 5,
  lightsCount: 6,
  lightsLimit: 7,
  blooming: 9,
  bloomStr: 10,
  lighting: 11,
  globalEffect: 12,
  globalEffectStr: 13,
  colorCorrection: 14,
  camera: 15,
  drawCalls: 16,
  computeCalls: 17,
  refreshTime: 18,
};

export default class EngineRenderStats {
  private static frameTimes: number[][] = [[0, 0]];
  private static currFrame = 0;
  private static cpuTime = 0;
  private static gpuTime = 0;
  private static gameData: GameData = {
    lightCurrent: 0,
    lightsLimit: 0,
    quadsCurrent: 0,
    quadsLimit: 0,
    blooming: false,
    bloomStr: 0,
    camera: "built-in",
    colorCorr: [0, 0, 0],
    globalEffect: "none",
    globalEffectStr: 0,
    lighting: false,
    drawCalls: 0,
    computeCalls: 0,
  };
  private static startTime = 0;
  private static lastFrameTime = 0;
  private static lastStartTime = 0;
  private static swapTime = 0;
  private static statsRefresh = REFRESH_RATE * 60;
  private static frame: HTMLDivElement;
  private static statsList: HTMLCollectionOf<HTMLParagraphElement>;
  private static frameCounter: HTMLParagraphElement;
  private static canvas: HTMLCanvasElement;
  private static ctx: CanvasRenderingContext2D;

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
    this.calculateFrames();
    this.calculateTimes(stopTime);
    // this.updateGameData();
    // this.updateCanvas();
    if (this.currFrame % this.statsRefresh === 0 && this.currFrame !== 0) {
      // this.updateFrame();
      EventBus.emit("updateStats", this.frameTimes);
      this.currFrame = 0;
    } else this.currFrame++;
  }

  public static setGameData(data: GameData) {
    this.gameData = data;
  }

  private static calculateFrames() {
    if (this.frameTimes.length === SAVED_FRAMES) this.frameTimes.shift();
    this.frameTimes.push([
      Math.floor(1000 / this.lastFrameTime / 100),
      performance.now() - this.startTime,
    ]);
  }

  private static calculateTimes(stopTime: number) {
    this.cpuTime = this.swapTime - this.startTime;
    this.gpuTime = stopTime - this.swapTime;
  }

  private static updateGameData() {
    this.statsList[
      HTML.quadCount
    ].innerText = `QuadCount: ${this.gameData.quadsCurrent}`;
    this.statsList[
      HTML.quadLimit
    ].innerText = `QuadsLimit: ${this.gameData.quadsLimit}`;
    this.statsList[
      HTML.lightsCount
    ].innerText = `LightsCount: ${this.gameData.lightCurrent}`;
    this.statsList[
      HTML.lightsLimit
    ].innerText = `LightsLimit: ${this.gameData.lightsLimit}`;
    this.statsList[
      HTML.bloomStr
    ].innerText = `bloomSTR: ${this.gameData.bloomStr}`;
    this.statsList[
      HTML.blooming
    ].innerText = `blooming: ${this.gameData.blooming}`;
    this.statsList[HTML.camera].innerText = `camera: ${this.gameData.camera}`;
    this.statsList[
      HTML.colorCorrection
    ].innerText = `colorCorrection: [R:${this.gameData.colorCorr[0]}|G:${this.gameData.colorCorr[1]}|B:${this.gameData.colorCorr[2]}]`;
    this.statsList[
      HTML.globalEffect
    ].innerText = `globalEffect: ${this.gameData.globalEffect}`;
    this.statsList[
      HTML.globalEffectStr
    ].innerText = `globalEffectSTR: ${this.gameData.globalEffectStr}`;
    this.statsList[
      HTML.lighting
    ].innerText = `lighting: ${this.gameData.lighting}`;
    this.statsList[
      HTML.computeCalls
    ].innerText = `computeCalls: ${this.gameData.computeCalls}`;
    this.statsList[
      HTML.drawCalls
    ].innerText = `drawCalls: ${this.gameData.drawCalls}`;
  }

  private static updateFrame() {
    const fps = String(
      this.frameTimes.reduce((acc, frame) => acc + frame[0], 0) / SAVED_FRAMES
    );
    this.frameCounter.innerText = `FPS: ${fps[0]}${fps[1]},${fps[2]}`;
    this.statsList[HTML.frameTime].innerText = `FrameTime: ${this.frameTimes
      .at(-1)?.[1]
      .toFixed(2)}MS`;
    this.statsList[HTML.cpuTime].innerText = `CPU time: ${this.cpuTime.toFixed(
      2
    )}ms`;
    this.statsList[HTML.gpuTime].innerText = `GPU time: ${this.gpuTime.toFixed(
      2
    )}ms`;
    this.statsList[
      HTML.refreshTime
    ].innerText = `Stats Refresh rate: ${REFRESH_RATE}s`;
  }

  private static updateCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.frameTimes.forEach((frame, index) => {
      const value = mapRange(
        clamp(frame[0], 0, 600),
        0,
        600,
        0,
        MAX_BAR_HEIGHT
      );
      const color = this.colorLerp(value, MAX_BAR_HEIGHT);
      this.ctx.fillStyle = color;
      this.ctx.fillRect(
        this.canvas.width - BAR_WIDTH - index * (BAR_WIDTH + BAR_GAP),
        this.canvas.height,
        BAR_WIDTH,
        -value
      );
    });
  }

  private static colorLerp(value: number, maxValue: number) {
    const normalizedValue = Math.min(Math.max(value / maxValue, 0), 1);
    const r = Math.floor(255 * (1 - normalizedValue));
    const g = Math.floor(255 * normalizedValue);
    const b = 0;
    return `rgb(${r},${g},${b})`;
  }
}
