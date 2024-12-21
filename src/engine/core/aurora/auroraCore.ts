import Vec2D from "@/math/vec2D";
import AuroraTexture from "./auroraTexture";

export interface sharedDataSchema {
  textureEnum: { [index: string]: number };
}
interface CoreOptions {
  alphaChannelOnCanvas?: "opaque" | "premultiplied";
  powerPreference?: "high-performance" | "low-power";
  useTextureStore?: boolean;
}
export default class Aurora {
  public static device: GPUDevice;
  public static context: GPUCanvasContext;
  public static canvas: HTMLCanvasElement;

  public static async initialize(
    canvas: HTMLCanvasElement,
    options?: CoreOptions
  ) {
    const context = canvas.getContext("webgpu")!;
    if (!navigator.gpu) {
      throw new Error("WebGPU not supported on this browser.");
    }
    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: options?.powerPreference ?? "low-power",
    });
    if (!adapter) {
      throw new Error("No appropriate GPUAdapter found.");
    }
    // Experimental StorageTexture
    // requiredFeatures: [
    // "chromium-experimental-read-write-storage-texture",
    // "bgra8unorm-storage",
    // ],
    const device = await adapter.requestDevice({
      requiredFeatures: ["bgra8unorm-storage"],
    });
    console.log(context);
    context.configure({
      device: device,
      format: navigator.gpu.getPreferredCanvasFormat(),
      alphaMode: options?.alphaChannelOnCanvas ?? "opaque",
    });

    if (options?.useTextureStore === false) {
      AuroraTexture.useStore = false;
    }
    Aurora.canvas = canvas;
    Aurora.context = context;
    Aurora.device = device;
  }
  public static resizeCanvas(size: Vec2D) {
    Aurora.canvas.width = size.x;
    Aurora.canvas.height = size.y;
  }
  public static setFirstAuroraFrame() {
    const encoder = Aurora.device.createCommandEncoder();
    const commandPass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: Aurora.context.getCurrentTexture().createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: [0, 1, 0, 1],
        },
      ],
    });
    commandPass.end();
    Aurora.device.queue.submit([encoder.finish()]);
  }
}
