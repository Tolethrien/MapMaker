import Link from "@/utils/link";
import { LayersLevel, Selectors } from "@/preload/globalLinks";
import OpenArrowSVG from "@/assets/icons/openArrow";
import IconButton from "@/editor/components/buttonAsIcon";
import ZIndexSVG from "@/assets/icons/zIndex";
import EntityManager from "@/engine/core/entitySystem/core/entityManager";
import { createSignal } from "solid-js";
import BrushSVG from "@/assets/icons/brush";
import TileSVG from "@/assets/icons/tile";
import StructSVG from "@/assets/icons/struct";
import EraserSVG from "@/assets/icons/eraser";
import { LutType } from "@/engine/core/modules/assetsManager";

const SVG_ACTIVE_STYLE = "w-8 h-8 stroke-app-acc-red";
const SVG_INACTIVE_STYLE = "w-8 h-8 stroke-app-acc-ice";
export default function Selector() {
  const [selector, setSelector] = Link.getLink<Selectors>("activeSelector");
  const [activeLut, setActiveLut] = Link.getLink<LutType>("activeLUT");
  const [zIndex, setZIndex] = Link.getLink<number>("z-index");
  const [layer, setLayer] = Link.getLink<LayersLevel>("layer");
  const engineInit = Link.get<number>("engineInit");
  const [tileVis, setTileVis] = createSignal(255);
  const [structVis, setStructVis] = createSignal(255);

  const setSingleLayer = (type: keyof LayersLevel, mod: "inc" | "dic") => {
    const change = mod === "inc" ? 1 : -1;
    const futureLayer = layer()[type] + change;
    if (futureLayer < 0) return;
    setLayer((prev) => {
      return { ...prev, [type]: prev[type] + change };
    });
    const visData = EntityManager.getLayerVis(type, futureLayer);
    if (type === "tile") setTileVis(visData);
    else setStructVis(visData);
  };

  return (
    <div
      class={`px-4 absolute bottom-4 left-1/2 -translate-x-1/2 bg-app-main-2 flex rounded-xl items-start shadow-lg border-1 border-app-acc-gray ${
        !engineInit() && "pointer-events-none brightness-75"
      }`}
    >
      <div class="border-r-2 border-app-acc-gray pr-2 py-1">
        <table class="table-auto w-full text-center">
          <thead>
            <tr class="*:pb-1 *:text-sm">
              <th class="px-2">Type</th>
              <th>Layer</th>
              <th class="px-8">Alpha</th>
              <th>Z-Index</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div class="flex justify-center" title="Tile">
                  <IconButton onClick={() => setActiveLut("tile")}>
                    <TileSVG
                      style={`w-5 h-5 ${
                        activeLut() === "tile" && "fill-app-acc-red"
                      }`}
                    />
                  </IconButton>
                </div>
              </td>
              <td class="flex items-center justify-center">
                <IconButton onClick={() => setSingleLayer("tile", "dic")}>
                  <OpenArrowSVG style="w-4 h-4 stroke-app-acc-wheat stroke-[10px] -rotate-90" />
                </IconButton>
                <p class="w-5">{layer().tile}</p>
                <IconButton onClick={() => setSingleLayer("tile", "inc")}>
                  <OpenArrowSVG style="w-4 h-4 stroke-app-acc-wheat stroke-[10px] rotate-90" />
                </IconButton>
              </td>
              <td>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={tileVis()}
                  class="w-20 selectorRange"
                  onInput={(e) => {
                    EntityManager.updateLayerVis(
                      "tile",
                      layer().tile,
                      Number(e.target.value)
                    );
                    setTileVis(Number(e.target.value));
                  }}
                />
              </td>
              <td>
                <div class="flex justify-center">
                  <ZIndexSVG style="w-5 h-5" />
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div class="flex justify-center" title="Structure">
                  <IconButton onClick={() => setActiveLut("structure")}>
                    <StructSVG
                      style={`w-5 h-5 ${
                        activeLut() === "structure" && "fill-app-acc-red"
                      }`}
                    />
                  </IconButton>
                </div>
              </td>
              <td class="flex items-center justify-center">
                <IconButton onClick={() => setSingleLayer("structure", "dic")}>
                  <OpenArrowSVG style="w-4 h-4 stroke-app-acc-wheat stroke-[10px] -rotate-90" />
                </IconButton>
                <p class="w-5">{layer().structure}</p>
                <IconButton onClick={() => setSingleLayer("structure", "inc")}>
                  <OpenArrowSVG style="w-4 h-4 stroke-app-acc-wheat stroke-[10px] rotate-90" />
                </IconButton>
              </td>
              <td>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={structVis()}
                  class="w-20 selectorRange"
                  onInput={(e) => {
                    EntityManager.updateLayerVis(
                      "structure",
                      layer().structure,
                      Number(e.target.value)
                    );
                    setStructVis(Number(e.target.value));
                  }}
                />
              </td>
              <td class="flex items-center justify-center">
                <IconButton onClick={() => setZIndex((prev) => prev - 1)}>
                  <OpenArrowSVG style="w-4 h-4 stroke-app-acc-wheat stroke-[10px] -rotate-90" />
                </IconButton>
                <p class="w-6">{zIndex()}</p>
                <IconButton onClick={() => setZIndex((prev) => prev + 1)}>
                  <OpenArrowSVG style="w-4 h-4 stroke-app-acc-wheat stroke-[10px] rotate-90" />
                </IconButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="py-1">
        <table class="table-auto w-full text-center text-sm">
          <thead>
            <tr class="*:px-3 *:pb-1">
              <th>Brush</th>
              <th>Eraser</th>
              <th>Lifter</th>
            </tr>
          </thead>
          <tbody>
            <tr class="*:pt-2">
              <td>
                <div class="flex justify-center">
                  <IconButton onClick={() => setSelector("brush")}>
                    <BrushSVG
                      style={`${
                        selector() === "brush"
                          ? SVG_ACTIVE_STYLE
                          : SVG_INACTIVE_STYLE
                      }`}
                    />
                  </IconButton>
                </div>
              </td>
              <td>
                <div class="flex justify-center">
                  <IconButton onClick={() => setSelector("eraser")}>
                    <EraserSVG
                      style={`${
                        selector() === "eraser"
                          ? SVG_ACTIVE_STYLE
                          : SVG_INACTIVE_STYLE
                      }`}
                    />
                  </IconButton>
                </div>
              </td>
              <td>
                <div class="flex justify-center">
                  <IconButton onClick={() => setSelector("lifter")}>
                    <ZIndexSVG
                      style={`${
                        selector() === "lifter"
                          ? SVG_ACTIVE_STYLE
                          : SVG_INACTIVE_STYLE
                      }`}
                    />
                  </IconButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
