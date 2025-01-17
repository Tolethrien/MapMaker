import GridSVG from "@/assets/icons/grid";
import IconButton from "../../reusable/buttonAsIcon";
import TileSVG from "@/assets/icons/tile";
import LayerSVG from "@/assets/icons/layer";
import ZIndexSVG from "@/assets/icons/zIndex";
import Link from "@/utils/link";
import { Selectors } from "@/preload/globalLinks";
import OpenArrowSVG from "@/assets/icons/openArrow";

export default function Selector() {
  const SVG_ACTIVE_STYLE = "w-8 h-8 stroke-app-acc-red";
  const SVG_INACTIVE_STYLE = "w-8 h-8 stroke-app-acc-ice";
  const [selector, setSelector] = Link.getLink<Selectors>("activeSelector");
  const [zIndex, setZIndex] = Link.getLink<number>("z-index");
  return (
    <div class="absolute bottom-12 left-1/2 -translate-x-1/2 bg-app-main-2 flex gap-4 px-8 py-1 rounded-lg items-center shadow-lg border-1 border-app-acc-gray">
      <div class="flex">
        <div class="relative flex flex-col items-center">
          <ZIndexSVG style="w-10 h-9 stroke-app-acc-ice opacity-50" />
          <p class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-3/4 text-lg font-medium">
            {zIndex()}
          </p>
          <p class="whitespace-nowrap">z-Index</p>
        </div>
        <div class="flex flex-col">
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
      <div class="w-[2px] h-8 bg-app-acc-wheat" />
      <div class="flex flex-col items-center">
        <IconButton onClick={() => setSelector("grid")}>
          <GridSVG
            style={`${
              selector() === "grid" ? SVG_ACTIVE_STYLE : SVG_INACTIVE_STYLE
            }`}
          />
        </IconButton>
        <p>Grid</p>
      </div>
      <div class="flex flex-col items-center">
        <IconButton onClick={() => setSelector("tile")}>
          <TileSVG
            style={`${
              selector() === "tile" ? SVG_ACTIVE_STYLE : SVG_INACTIVE_STYLE
            }`}
          />
        </IconButton>
        <p>Tile</p>
      </div>
      <div class="flex flex-col items-center">
        <IconButton onClick={() => setSelector("layer")}>
          <LayerSVG
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
