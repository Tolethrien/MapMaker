import EngineDebugger from "../debugger/debugger";

export default class GlobalStore {
  private static store: Map<string, unknown> = new Map();

  public static add<T>(key: string, data: T) {
    this.store.set(key, data);
  }

  public static remove(key: string) {
    if (!this.store.delete(key))
      EngineDebugger.showWarn(
        `GlobalStore: ${key} is set to be removed but it's doesn't exist in store`,
        "Store"
      );
  }

  public static get<T>(key: string): [T, (val: T) => void] {
    EngineDebugger.assertCondition(this.store.has(key), {
      msg: `GlobalStore: ${key} doesn't exist in store`,
      module: "Store",
    });
    const getter = this.store.get(key) as T;
    const setter = (val: T) => this.store.set(key, val);
    return [getter, setter];
  }
}
