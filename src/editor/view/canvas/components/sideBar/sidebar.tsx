import ColliderSVG from "@/assets/icons/collider";
import GridSVG from "@/assets/icons/grid";
import MapSVG from "@/assets/icons/gridMenu";
import StructSVG from "@/assets/icons/struct";
import TileSVG from "@/assets/icons/tile";
import IconButton from "@/editor/components/buttonAsIcon";
import { MapMods, MapView } from "@/preload/globalLinks";
import Link from "@/utils/link";

export default function SideBar() {
  const [GridMenu, setGridMenu] = Link.getLink<boolean>("gridMenu");
  const [mapView, setMapView] = Link.getLink<MapView>("mapView");
  const [mapMods, setMapMods] = Link.getLink<MapMods>("mapMods");
  return (
    <div class="absolute left-0 top-[30px] flex flex-col bg-app-main-2 bg-opacity-80 backdrop-blur-lg rounded-e-xl shadow-lg border-1 border-l-0 border-app-acc-gray h-fit py-1">
      <div class="flex flex-col text-center border-b-1 border-app-acc-gray px-1 py-2">
        <IconButton
          onClick={() => setGridMenu((prev) => !prev)}
          title="Chunk Map"
        >
          <MapSVG style={`w-5 h-5 ${GridMenu() && "fill-app-acc-red"}`} />
        </IconButton>
        {/* <IconButton onClick={() => console.log("select TIle")}>
          <TileSVG style="w-5 h-5" />
        </IconButton> */}
      </div>
      <div class="flex flex-col border-b-1 border-app-acc-gray px-1 py-2">
        <IconButton
          onClick={() =>
            setMapView((prev) =>
              prev === "singleTile" ? "none" : "singleTile"
            )
          }
          title="Single Layer Tile"
        >
          <TileSVG
            style={`w-5 h-5 ${
              mapView() === "singleTile" && "fill-app-acc-red"
            }`}
          />
        </IconButton>
        <IconButton
          onClick={() =>
            setMapView((prev) =>
              prev === "singleStruct" ? "none" : "singleStruct"
            )
          }
          title="Single Layer Structure"
        >
          <StructSVG
            style={`w-5 h-5 ${
              mapView() === "singleStruct" && "fill-app-acc-red"
            }`}
          />
        </IconButton>
      </div>
      <div class="flex  flex-col px-1 py-2">
        <IconButton
          onClick={() =>
            setMapMods((prev) => ({ ...prev, collider: !prev.collider }))
          }
          title="Colliders"
        >
          <ColliderSVG
            style={`w-5 h-5 ${mapMods().collider && "stroke-app-acc-red"}`}
          />
        </IconButton>
        <IconButton
          onClick={() => setMapMods((prev) => ({ ...prev, grid: !prev.grid }))}
          title="Show Grid"
        >
          <GridSVG style={`w-5 h-5 ${mapMods().grid && "fill-app-acc-red"}`} />
        </IconButton>
      </div>
    </div>
  );
}
