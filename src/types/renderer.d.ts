import { COMPONENTS } from "@/engine/core/entitySys/consts";

declare global {
  type TypeOfComponent<C extends keyof typeof COMPONENTS> = InstanceType<
    (typeof COMPONENTS)[C]
  >;
}
