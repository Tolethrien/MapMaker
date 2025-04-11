import { LutType } from "@/engine/core/modules/assetsManager";
import GlobalStore from "@/engine/core/modules/globalStore";
import Link from "@/utils/link";
export type Selectors = "brush" | "eraser" | "lifter";
export type MapView = "singleTile" | "singleStruct" | "none";
export type MapMods = Record<"collider" | "anchor" | "grid", boolean>;
export interface PassManifold {
  LutID: string;
  type: LutType;
}

export type LayersLevel = Record<LutType, number>;
export type Note = { type: "error" | "info" | "success"; value: string };
export default function initLinks() {
  Link.add<boolean>("engineInit", false);
  Link.add<boolean>("gridMenu", false);
  Link.add<Selectors>("activeSelector", "eraser");
  Link.add<MapView>("mapView", "none");
  Link.add<MapMods>("mapMods", {
    anchor: false,
    collider: false,
    grid: true,
  });
  Link.add<LutType>("activeLUT", "structure");
  Link.add<number>("z-index", 0);
  Link.add<LayersLevel>("layer", { structure: 0, tile: 0 });
  Link.add<Position2D>("cameraPos", { x: 0, y: 0 }, { equals: false });
  Link.add<ProjectConfig>(
    "projectConfig",
    {
      chunkSizeInPixels: { h: 0, w: 0 },
      chunkSizeInTiles: { h: 0, w: 0 },
      name: "",
      projectPath: "",
      tileSize: { h: 0, w: 0 },
    },
    { equals: false }
  );
  Link.add<Note[]>("notify", []);
  GlobalStore.add<PassManifold>("passManifold", {
    LutID: "",
    type: "tile",
  });
}
