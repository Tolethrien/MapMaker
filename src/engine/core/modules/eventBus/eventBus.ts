import EngineDebugger from "../debugger/debugger";
type eventListener = { name: string; callback: (e: never) => void };
type EventDriver = Map<eventListener["name"], eventListener["callback"]>;

export default class EventBus {
  private static eventBus: Map<string, EventDriver> = new Map();

  public static add(event: string) {
    this.eventBus.set(event, new Map());
  }

  public static remove(event: string) {
    this.eventBus.delete(event) ??
      EngineDebugger.showError(`No event with name ${event} to delete`);
  }

  public static on(event: string, listener: eventListener) {
    this.eventBus.get(event)?.set(listener.name, (e) => listener.callback(e)) ??
      EngineDebugger.showError(
        `No event with name ${event}. This is a custom event, make sure you register it first with 'addCustom'!`
      );
  }

  public static off(event: string, listenerName: eventListener["name"]) {
    this.eventBus.get(event)?.delete(listenerName) ??
      EngineDebugger.showError(
        `No event callback with name ${listenerName} in event: "${event}"`
      );
  }

  public static emit<T extends unknown>(event: string, options?: T) {
    this.eventBus.get(event)?.forEach((listener) => listener(options as never));
  }
}
