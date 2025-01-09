import { ProjectConfig } from "@/engine/core/entitySystem/core/entityManager";
import Link from "@/vault/link";
export type Selectors = "tile" | "grid" | "layer";

export default function initLinks() {
  Link.add<boolean>("engineInit", false);
  Link.add<Selectors>("activeSelector", "tile");
  Link.add<Position2D>("cameraPos", { x: 0, y: 0 }, { equals: false });
  Link.add<ProjectConfig>("projectConfig", {
    chunkSizeInPixels: { h: 0, w: 0 },
    chunkSizeInTiles: { h: 0, w: 0 },
    name: "",
    projectPath: "",
    tileSize: { h: 0, w: 0 },
  });
}
