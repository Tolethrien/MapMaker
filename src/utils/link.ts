import EngineDebugger from "@/engine/core/modules/debugger";
import {
  Accessor,
  createSignal,
  Setter,
  Signal,
  SignalOptions,
} from "solid-js";

export default class Link {
  private static store: Map<string, Signal<any>> = new Map();

  public static clearStore() {
    this.store.clear();
  }
  public static add<T>(key: string, data: T, options?: SignalOptions<T>) {
    this.store.set(key, createSignal<T>(data, options));
  }
  public static remove(key: string) {
    if (!this.store.delete(key))
      EngineDebugger.showWarn(
        `GlobalStore: ${key} is set to be removed but it's doesn't exist in store`,
        "Store"
      );
  }
  public static getLink<T>(key: string): Signal<T> {
    EngineDebugger.assertCondition(this.store.has(key), {
      msg: `GlobalStore: ${key} doesn't exist in store`,
      module: "Store",
    });
    return this.store.get(key) as Signal<T>;
  }
  public static get<T>(key: string): Accessor<T> {
    EngineDebugger.assertCondition(this.store.has(key), {
      msg: `GlobalStore: ${key} doesn't exist in store`,
      module: "Store",
    });
    return this.store.get(key)![0];
  }
  public static set<T>(key: string): Setter<T> {
    EngineDebugger.assertCondition(this.store.has(key), {
      msg: `GlobalStore: ${key} doesn't exist in store`,
      module: "Store",
    });
    return this.store.get(key)![1];
  }
}
