import Link from "@/utils/link";
export type Selectors = "tile" | "grid" | "layer";
export type TextureViewSelected = {
  index: number;
  position: Position2D;
  tileSize: Size2D;
  textureSize: Size2D;
};
export default function initLinks() {
  Link.add<boolean>("engineInit", false);
  Link.add<Selectors>("activeSelector", "tile");
  Link.add<number>("z-index", 0);
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
  Link.add<TextureViewSelected>("textureViewSelected", {
    position: { x: -1, y: -1 },
    tileSize: { w: -1, h: -1 },
    textureSize: { w: -1, h: -1 },
    index: -1,
  });
}
