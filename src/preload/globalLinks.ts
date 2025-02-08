import GlobalStore from "@/engine/core/modules/globalStore";
import Link from "@/utils/link";
export type Selectors = "tile" | "grid" | "layer";
export interface PassManifold {
  textureID: string;
  tileCropIndex: number;
  tileSize: Size2D;
  textureSize: Size2D;
  gridPos: Position2D;
}
export type Note = { type: "error" | "info" | "success"; value: string };
export default function initLinks() {
  Link.add<boolean>("engineInit", false);
  Link.add<Selectors>("activeSelector", "tile");
  Link.add<number>("z-index", 0);
  Link.add<number>("layer", 0);
  Link.add<boolean>("showGrid", true);
  Link.add<Position2D>("cameraPos", { x: 0, y: 0 }, { equals: false });
  Link.add<ProjectConfig>(
    "projectConfig",
    {
      chunkSizeInPixels: { h: 0, w: 0 },
      chunkSizeInTiles: { h: 0, w: 0 },
      name: "",
      projectPath: "",
      tileSize: { h: 0, w: 0 },
      textureUsed: [],
    },
    { equals: false }
  );
  Link.add<Note[]>("notify", []);
  GlobalStore.add<PassManifold>("passManifold", {
    textureID: "",
    textureSize: { h: 0, w: 0 },
    tileCropIndex: -1,
    tileSize: { h: 0, w: 0 },
    gridPos: { x: 0, y: 0 },
  });
}
