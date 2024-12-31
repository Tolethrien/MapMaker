import { COMPONENTS } from "@/engine/core/entitySys/consts";

declare global {
  type TypeOfComponent<C extends keyof typeof COMPONENTS> = InstanceType<
    (typeof COMPONENTS)[C]
  >;
  type Position2D = { x: number; y: number };
  type Size2D = { w: number; h: number };
  type HSLA = [number, number, number, number];
}
