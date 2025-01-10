import GridSVG from "@/assets/icons/grid";
import IconButton from "../../reusable/buttonAsIcon";
import TileSVG from "@/assets/icons/tile";
import LayerSVG from "@/assets/icons/layer";
import ZIndexSVG from "@/assets/icons/zIndex";
import LocationSVG from "@/assets/icons/location";
import Link from "@/vault/link";
import { Selectors } from "@/API/links";

export default function Selector() {
  const SVG_ACTIVE_STYLE = "w-8 h-8 stroke-app-acc-red";
  const SVG_INACTIVE_STYLE = "w-8 h-8 stroke-app-acc-ice";
  const [selector, setSelector] = Link.getLink<Selectors>("activeSelector");
  const position = Link.get<Position2D>("cameraPos");
  return (
    <div class="absolute bottom-12 left-1/2 -translate-x-1/2 text-app-acc-wheat bg-app-bg-2 flex gap-4 px-8 py-1 rounded-lg items-center shadow-lg border-1 border-app-bg-4">
      <div class="flex flex-col items-center">
        <div class="relative w-10 h-10">
          <ZIndexSVG style="w-full h-full stroke-app-acc-ice opacity-50" />
          <p class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-medium">
            1
          </p>
        </div>
        <p class="whitespace-nowrap">z-Index</p>
      </div>
      <div class="flex flex-col items-center">
        <div class="relative w-10 h-10">
          <LocationSVG style="w-full h-full stroke-app-acc-ice opacity-25 translate-y-1" />
          <p class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-base font-medium leading-none text-app-acc-wheat">
            x:{position().x} y:{position().y}
          </p>
        </div>
        <p>Camera</p>
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
