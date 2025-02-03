import Link from "@/utils/link";
import { Selectors } from "@/preload/globalLinks";
import OpenArrowSVG from "@/assets/icons/openArrow";
import IconButton from "@/editor/components/buttonAsIcon";
import LayerSVG from "@/assets/icons/layer";
import GridSelectSVG from "@/assets/icons/gridSelect";
import TileSelectSVG from "@/assets/icons/tileSelect";
import LayerSelectSVG from "@/assets/icons/layerSelect";
import { changeSelector } from "@/utils/utils";
import GridSVG from "@/assets/icons/grid";

export default function Selector() {
  const SVG_ACTIVE_STYLE = "w-6 h-6 stroke-app-acc-red";
  const SVG_INACTIVE_STYLE = "w-6 h-6 stroke-app-acc-ice";
  const selector = Link.get<Selectors>("activeSelector");
  const [zIndex, setZIndex] = Link.getLink<number>("z-index");
  const [gridVisible, setGridVisible] = Link.getLink<boolean>("showGrid");

  const engineInit = Link.get<number>("engineInit");
  return (
    <div
      class={`absolute bottom-12 left-1/2 -translate-x-1/2 bg-app-main-2 flex gap-4 px-8 py-1 rounded-lg items-center shadow-lg border-1 border-app-acc-gray ${
        !engineInit() && "pointer-events-none brightness-75"
      }`}
    >
      <div class="flex flex-col items-center justify-center">
        <IconButton onClick={() => setGridVisible((prev) => !prev)}>
          <GridSVG style={`${!gridVisible() && "brightness-50"} w-6 h-6`} />
        </IconButton>
        <p class="w-12">{gridVisible() ? "Visible" : "Hidden"}</p>
      </div>
      <div class="flex gap-2">
        <div class="flex flex-col items-center">
          <div class="p-1 relative">
            <LayerSVG style="w-6 h-6 stroke-app-acc-ice opacity-50" />
            <p class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-medium">
              {zIndex()}
            </p>
          </div>
          <p>Z-Index</p>
        </div>
        <div class="flex flex-col justify-center">
          <IconButton onClick={() => setZIndex((prev) => prev + 1)}>
            <OpenArrowSVG style="w-4 h-4 stroke-app-acc-wheat stroke-[10px]"></OpenArrowSVG>
          </IconButton>
          <IconButton
            onClick={() => zIndex() > 0 && setZIndex((prev) => prev - 1)}
          >
            <OpenArrowSVG style="w-4 h-4 rotate-180 stroke-app-acc-wheat stroke-[10px]"></OpenArrowSVG>
          </IconButton>
        </div>
      </div>
      <div class="flex w-[2px] h-12 bg-app-acc-wheat" />
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
  );
}
