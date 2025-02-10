import Link from "@/utils/link";
import { Selectors } from "@/preload/globalLinks";
import OpenArrowSVG from "@/assets/icons/openArrow";
import IconButton from "@/editor/components/buttonAsIcon";
import LayerSVG from "@/assets/icons/layer";
import GridSelectSVG from "@/assets/icons/gridSelect";
import TileSelectSVG from "@/assets/icons/tileSelect";
import LayerSelectSVG from "@/assets/icons/layerSelect";
import { changeSelector, sendNotification } from "@/utils/utils";
import GridSVG from "@/assets/icons/grid";
import ZIndexSVG from "@/assets/icons/zIndex";
import EntityManager from "@/engine/core/entitySystem/core/entityManager";
import { batch, createEffect, createSignal } from "solid-js";
import { writeVisibilityConfig } from "@/utils/projectUtils";
import BrushSVG from "@/assets/icons/brush";
import EyeSVG from "@/assets/icons/eye";

const SVG_ACTIVE_STYLE = "w-6 h-6 stroke-app-acc-red";
const SVG_INACTIVE_STYLE = "w-6 h-6 stroke-app-acc-ice";
export default function Selector() {
  const selector = Link.get<Selectors>("activeSelector");
  const [zIndex, setZIndex] = Link.getLink<number>("z-index");
  const [layer, setLayer] = Link.getLink<number>("layer");
  const [gridVisible, setGridVisible] = Link.getLink<boolean>("showGrid");
  const [singleLayer, setSingleLayer] =
    Link.getLink<boolean>("singleLayerMode");
  const engineInit = Link.get<number>("engineInit");
  const [visibility, setVisibility] = createSignal(200);

  createEffect(() => {
    engineInit() && setVisibility(EntityManager.getLayerVis(0));
  });

  const updateLayer = (type: "up" | "down") => {
    const layerIndex = layer();
    batch(() => {
      if (type === "up") {
        setLayer(layerIndex + 1);
        setVisibility(EntityManager.getLayerVis(layerIndex + 1));
      } else {
        if (layer() === 0) return;
        setLayer(layerIndex - 1);
        setVisibility(EntityManager.getLayerVis(layerIndex - 1));
      }
    });
  };

  const writeVisToConfig = async () => {
    const { error } = await writeVisibilityConfig();
    if (error) sendNotification({ type: "error", value: error });
  };

  return (
    <div
      class={`absolute bottom-12 left-1/2 -translate-x-1/2 bg-app-main-2 flex rounded-lg items-center shadow-lg border-1 border-app-acc-gray ${
        !engineInit() && "pointer-events-none brightness-75"
      }`}
    >
      {/* toggle section */}
      <div class="border-r-2 border-app-acc-gray px-4 py-2 flex">
        <div class="flex flex-col items-center justify-center">
          <IconButton onClick={() => setGridVisible((prev) => !prev)}>
            <GridSVG style={`${!gridVisible() && "brightness-50"} w-6 h-6`} />
          </IconButton>
          <p class="w-12">{gridVisible() ? "Visible" : "Hidden"}</p>
        </div>
      </div>

      {/* scrolls section */}
      <div class="border-r-2 border-app-acc-gray px-4 py-2 flex gap-4">
        <div class="flex gap-2">
          <div class="flex flex-col items-center">
            <div class="p-1 relative">
              <LayerSVG style="w-6 h-6 stroke-app-acc-ice opacity-50" />
              <p class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-medium">
                {layer()}
              </p>
              <IconButton
                onClick={() => setSingleLayer((prev) => !prev)}
                style="absolute top-[-0.5rem] left-[-1rem]"
              >
                <EyeSVG
                  style={`w-4 h-4 ${singleLayer() && "fill-app-acc-wheat"}`}
                  open={singleLayer()}
                />
              </IconButton>
            </div>
            <p>Layer</p>
          </div>
          <div class="flex flex-col justify-center">
            <IconButton onClick={() => updateLayer("up")}>
              <OpenArrowSVG style="w-4 h-4 stroke-app-acc-wheat stroke-[10px]" />
            </IconButton>
            <IconButton onClick={() => updateLayer("down")}>
              <OpenArrowSVG style="w-4 h-4 rotate-180 stroke-app-acc-wheat stroke-[10px]" />
            </IconButton>
          </div>
          <div class="relative w-4">
            <input
              type="range"
              min="0"
              max="255"
              value={visibility()}
              class="selectorVerticalRange -rotate-90 w-14 h-[6px] absolute left-0 -translate-x-6 translate-y-6"
              onInput={(e) => {
                EntityManager.updateLayerVis(layer(), Number(e.target.value));
                setVisibility(Number(e.target.value));
              }}
              onChange={writeVisToConfig}
            />
          </div>
        </div>
        <div class="flex whitespace-nowrap">
          <div class="flex flex-col items-center">
            <div class="p-1 relative">
              {/* //TODO: zmienic ta ikone bo gownianie wyglada */}
              <ZIndexSVG style="w-6 h-6 stroke-app-acc-ice opacity-50" />
              <p class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-medium">
                {zIndex()}
              </p>
            </div>
            <p>Z-index</p>
          </div>
          <div class="flex flex-col justify-center">
            <IconButton onClick={() => setZIndex((prev) => prev + 1)}>
              <OpenArrowSVG style="w-4 h-4 stroke-app-acc-wheat stroke-[10px]" />
            </IconButton>
            <IconButton onClick={() => setZIndex((prev) => prev - 1)}>
              <OpenArrowSVG style="w-4 h-4 rotate-180 stroke-app-acc-wheat stroke-[10px]" />
            </IconButton>
          </div>
        </div>
      </div>
      {/* selector section */}
      <div class="px-4 py-2 flex gap-4">
        <div class="flex flex-col items-center">
          <IconButton onClick={() => changeSelector("brush")}>
            <BrushSVG
              style={`${
                selector() === "brush" ? SVG_ACTIVE_STYLE : SVG_INACTIVE_STYLE
              }`}
            />
          </IconButton>
          <p>Brush</p>
        </div>
        <div class="flex flex-col items-center">
          <IconButton onClick={() => changeSelector("grid")}>
            <GridSelectSVG
              style={`${
                selector() === "grid" ? SVG_ACTIVE_STYLE : SVG_INACTIVE_STYLE
              }`}
            />
          </IconButton>
          <p>Grid</p>
        </div>
        <div class="flex flex-col items-center">
          <IconButton onClick={() => changeSelector("tile")}>
            <TileSelectSVG
              style={`${
                selector() === "tile" ? SVG_ACTIVE_STYLE : SVG_INACTIVE_STYLE
              }`}
            />
          </IconButton>
          <p>Tile</p>
        </div>
        <div class="flex flex-col items-center">
          <IconButton onClick={() => changeSelector("layer")}>
            <LayerSelectSVG
              style={`${
                selector() === "layer" ? SVG_ACTIVE_STYLE : SVG_INACTIVE_STYLE
              }`}
            />
          </IconButton>
          <p>Layer</p>
        </div>
      </div>
    </div>
  );
}
