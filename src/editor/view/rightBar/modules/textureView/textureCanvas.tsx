import { Accessor, createEffect, onMount } from "solid-js";
import CanvasController from "./canvasController";
import { LutType, View } from "@/engine/core/modules/assetsManager";
import Link from "@/utils/link";

interface Props {
  // texture: TextureMeta;
  view: Accessor<View | undefined>;
}
export default function TextureCanvas(props: Props) {
  let canvas!: HTMLCanvasElement;

  onMount(() => {
    if (canvas) {
      CanvasController.Init(canvas);
    }
  });
  createEffect(() => {
    if (props.view() && props.view()!.id !== CanvasController.getViewID()) {
      CanvasController.setView(props.view()!);
      Link.set<LutType>("activeLUT")(props.view()!.type);
    }
  });
  return (
    <>
      <canvas ref={canvas} class="bg-app-bg-3 border-1 border-white" />
    </>
  );
}
