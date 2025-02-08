import { API } from "../preload/preload";

declare global {
  interface Window {
    API: typeof API;
  }
  type AsyncStatus = { success: boolean; error: string };
  type Prettify<T> = {
    [K in keyof T]: T[K];
  } & {};
  type Position2D = { x: number; y: number };
  type Size2D = { w: number; h: number };
  type HSLA = [number, number, number, number];
  type ProjectTextureFile = {
    name: string;
    path: string;
    tileSize: Size2D;
    id: string;
  };
  export interface ProjectConfig {
    projectPath: string;
    name: string;
    tileSize: Size2D;
    chunkSizeInTiles: Size2D;
    chunkSizeInPixels: Size2D;
    textureUsed: ProjectTextureFile[];
    layersVisibility: [number, number][];
  }
}
