import { createEffect } from "solid-js";
import CanvasController from "./canvasControl";
import { getAPI } from "@/preload/getAPI";
interface Props {
  index: number;
  texture: ProjectTextureFile;
}
const { loadTexture } = getAPI("API_FILE_SYSTEM");
export default function TextureCanvas(props: Props) {
  let canvas!: HTMLCanvasElement;
  let controller!: CanvasController;
  //TODO: usuwanie tekstur
  //TOD: dynamiczne dodawanie tekstury do aurory
  createEffect(async () => {
    if (canvas) {
      //TODO: robisz to tutaj i w silniku wiec moze jakos razem?
      const textureStatus = await loadTexture(props.texture.path);
      if (!textureStatus.success) console.error(textureStatus.error);
      controller = new CanvasController(
        canvas,
        textureStatus.src,
        props.index,
        props.texture.tileSize
      );
    }
  });
  return <canvas ref={canvas} class="bg-app-bg-3" />;
}
