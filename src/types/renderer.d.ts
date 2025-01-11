import { COMPONENTS } from "@/engine/core/entitySystem/core/consts";
declare global {
  type TypeOfComponent<C extends keyof typeof COMPONENTS> = InstanceType<
    (typeof COMPONENTS)[C]
  >;
  type Position2D = { x: number; y: number };
  type Size2D = { w: number; h: number };
  type HSLA = [number, number, number, number];
  type ProjectTextureFile = { name: string; path: string; tileSize: Size2D };
  export interface ProjectConfig {
    projectPath: string;
    name: string;
    tileSize: Size2D;
    chunkSizeInTiles: Size2D;
    chunkSizeInPixels: Size2D;
    textureUsed: ProjectTextureFile[];
  }
}
