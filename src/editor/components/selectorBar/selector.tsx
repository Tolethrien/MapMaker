import GridSVG from "@/assets/icons/grid";
import IconButton from "../reusable/buttonAsIcon";
import { useContext } from "solid-js";
import TileSVG from "@/assets/icons/tile";
import LayerSVG from "@/assets/icons/layer";
import ZIndexSVG from "@/assets/icons/zIndex";
import LocationSVG from "@/assets/icons/location";
import { globalContext } from "@/editor/providers/global";
export default function Selector() {
  const SVG_ACTIVE_STYLE = "w-8 h-8 stroke-app-acc-red";
  const SVG_INACTIVE_STYLE = "w-8 h-8 stroke-app-acc-ice";
  const { activeSelector, setActiveSelector } = useContext(globalContext)!;
  return (
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 text-app-acc-wheat bg-app-bg-2 flex gap-4 px-8 py-1 rounded-lg items-center shadow-lg border-1 border-app-bg-4">
      <div class="flex flex-col items-center">
        <div class="relative w-10 h-10">
          <ZIndexSVG style="w-full h-full stroke-app-acc-ice opacity-50" />
          <p class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-medium">
            1
          </p>
        </div>
        <p>z-Index</p>
      </div>
      <div class="flex flex-col items-center">
        <div class="relative w-10 h-10">
          <LocationSVG style="w-full h-full stroke-app-acc-ice opacity-25 translate-y-1" />
          <p class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-base font-medium leading-none text-app-acc-wheat">
            x:01 y:12
          </p>
        </div>
        <p>Camera</p>
      </div>
      <div class="w-[2px] h-8 bg-app-acc-wheat" />
      <div class="flex flex-col items-center">
        <IconButton onClick={() => setActiveSelector("grid")}>
          <GridSVG
            style={`${
              activeSelector() === "grid"
                ? SVG_ACTIVE_STYLE
                : SVG_INACTIVE_STYLE
            }`}
          />
        </IconButton>
        <p>Grid</p>
      </div>
      <div class="flex flex-col items-center">
        <IconButton onClick={() => setActiveSelector("tile")}>
          <TileSVG
            style={`${
              activeSelector() === "tile"
                ? SVG_ACTIVE_STYLE
                : SVG_INACTIVE_STYLE
            }`}
          />
        </IconButton>
        <p>Tile</p>
      </div>
      <div class="flex flex-col items-center">
        <IconButton onClick={() => setActiveSelector("layer")}>
          <LayerSVG
            style={`${
              activeSelector() === "layer"
                ? SVG_ACTIVE_STYLE
                : SVG_INACTIVE_STYLE
            }`}
          />
        </IconButton>
        <p>Layer</p>
      </div>
    </div>
  );
}
