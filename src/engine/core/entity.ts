import Engine from "../engine";
import Component from "./component";
import { COMPONENTS } from "./consts";
export type ReturnComponent<T extends keyof typeof COMPONENTS> =
  (typeof COMPONENTS)[T] extends new (...args: any[]) => infer R ? R : never;
export default abstract class Entity {
  private id: string;
  private identifiers: {
    tags: Set<string>;
    marker: string;
  };
  private components: Map<keyof typeof COMPONENTS, Component> = new Map();

  abstract update(): void;
  constructor() {
    this.id = crypto.randomUUID();
    this.identifiers = {
      tags: new Set(),
      marker: "",
    };
    Engine.addEntity(this);
  }
  addComponent<T extends keyof typeof COMPONENTS>(
    componentName: T,
    props?: ConstructorParameters<(typeof COMPONENTS)[T]>[0]
  ) {
    const component = new COMPONENTS[componentName](props ?? {});
    this.components.set(componentName, component);
    return component;
  }
  getComponent<T extends keyof typeof COMPONENTS>(componentName: T) {
    return this.components.get(componentName) as ReturnComponent<T>;
  }
  public get getID() {
    return this.id;
  }
  public addTag(tag: string) {
    this.identifiers.tags.add(tag);
  }
  public removeTag(tag: string) {
    this.identifiers.tags.delete(tag);
  }
  public setMarker(marker: string) {
    this.identifiers.marker = marker;
  }
}
