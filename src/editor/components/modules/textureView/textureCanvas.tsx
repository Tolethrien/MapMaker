import { createEffect } from "solid-js";
import CanvasController from "./canvasControl";
interface Props {
  image: string;
}
export default function TextureCanvas({ image }: Props) {
  let canvas!: HTMLCanvasElement;
  let controller!: CanvasController;
  createEffect(() => {
    if (canvas) controller = new CanvasController(canvas, image);
  });
  return <canvas ref={canvas} class="bg-app-bg-3" />;
}
