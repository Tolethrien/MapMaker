import CloseSVG from "@/assets/icons/close";
import FolderSVG from "@/assets/icons/folder";
import PickerSVG from "@/assets/icons/picker";
import IconButton from "@/editor/components/buttonAsIcon";
import Input from "@/editor/components/input";
import Modal from "@/editor/components/modal";
import AssetsManager from "@/utils/assetsManger";
import EventBus from "@/utils/eventBus";
import { Accessor, createSignal, For, onMount, Setter } from "solid-js";

interface Props {
  onOpen: () => boolean;
  onClose: () => void;
}
export default function ObjectSetViewModal(props: Props) {
  let canvas!: HTMLCanvasElement;
  let ctx!: CanvasRenderingContext2D;
  let canvasSnapImg: HTMLImageElement | undefined = undefined;
  const [textures, setTextures] = createSignal(
    AssetsManager.getTexturesArray()
  );
  const [tileSize, setTileSize] = createSignal({ x: 32, y: 32 });
  const [selectedTextureIndex, setSelectedTextureIndex] = createSignal<
    number | undefined
  >(undefined);

  EventBus.on("reTexture", {
    name: "tilesetView",
    callback: () => {
      setTextures(AssetsManager.getTexturesArray());
      console.log(AssetsManager.getTexturesArray());
    },
  });
  onMount(() => {
    if (canvas) ctx = canvas.getContext("2d")!;
  });
  const loadImage = (src: string) => {
    return new Promise<HTMLImageElement>((res, err) => {
      const img = new Image();
      img.src = src;
      img.onload = () => res(img);
      img.onerror = (error) => err(error);
    });
  };
  const createGridedImage = async (index: number) => {
    setSelectedTextureIndex(index);
    const src = textures()[selectedTextureIndex()!].path;
    const img = await loadImage(src);
    canvasSnapImg = img;
    canvas.width = img.width;
    canvas.height = img.height;
    drawCanvas();
  };
  const drawCanvas = () => {
    if (!canvasSnapImg) return;
    const sizeX = tileSize().x > 4 ? tileSize().x : 4;
    const sizeY = tileSize().y > 4 ? tileSize().y : 4;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(canvasSnapImg, 0, 0);
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += sizeX) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
    }
    for (let y = 0; y < canvas.height; y += sizeY) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();
  };
  return (
    <Modal open={props.onOpen}>
      <div>OBJsadasdasdasdasdasd</div>
      <button
        class="bg-app-acc-red text-app-acc-wheat rounded-sm absolute top-0 right-0"
        onclick={props.onClose}
      >
        <CloseSVG style="h-3 w-3 my-2 mx-3" />
      </button>
    </Modal>
    // <div>
    //   pick texture or add new
    //   <div>
    //     <select
    //       name="texture..."
    //       class="text-black"
    //       onChange={(e) => createGridedImage(e.target.selectedIndex - 1)}
    //     >
    //       <option value="" disabled selected hidden>
    //         texture...
    //       </option>
    //       <For each={textures()}>
    //         {(texture) => <option value={texture.id}>{texture.name}</option>}
    //       </For>
    //     </select>
    //     <div class="flex items-center">
    //       <FolderSVG style="w-5 h-5" />
    //       <label class="text-xl">
    //         <span class="pr-4 pl-2">Path:</span>
    //         <Input placeholder="C\\..." value={""} type="selector" />
    //         <IconButton onClick={() => {}}>
    //           <PickerSVG style="w-5 h-5 ml-2 translate-y-3" />
    //         </IconButton>
    //       </label>
    //     </div>
    //   </div>
    //   <div class="w-[400px] h-[250px] overflow-auto bg-black">
    //     <canvas ref={canvas} />
    //   </div>
    //   <div class="flex flex-col gap-3 text-black">
    //     <input
    //       type="number"
    //       value={tileSize().x}
    //       onInput={(e) => {
    //         setTileSize((prev) => {
    //           return { x: Number(e.target.value), y: prev.y };
    //         });
    //         drawCanvas();
    //       }}
    //     >
    //       x
    //     </input>
    //     <input
    //       type="number"
    //       value={tileSize().y}
    //       onInput={(e) => {
    //         setTileSize((prev) => {
    //           return { x: prev.x, y: Number(e.target.value) };
    //         });
    //         drawCanvas();
    //       }}
    //     >
    //       y
    //     </input>
    //   </div>
    // </div>
  );
}
