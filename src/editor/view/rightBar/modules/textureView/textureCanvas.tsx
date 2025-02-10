import { createEffect } from "solid-js";
import CanvasController from "./canvasControl";
import { TextureMeta } from "@/utils/assetsManger";

interface Props {
  texture: TextureMeta;
}
export default function TextureCanvas(props: Props) {
  let canvas!: HTMLCanvasElement;
  let controller!: CanvasController;
  createEffect(() => {
    if (canvas) {
      controller = new CanvasController(canvas, props.texture);
    }
  });
  return <canvas ref={canvas} class="bg-app-bg-3 border-1 border-white" />;
}
