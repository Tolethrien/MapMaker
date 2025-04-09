import EngineDebugger from "@/engine/core/modules/debugger";

type eventListener<T> = {
  name: string;
  callback: (e: T) => void;
};
type EventDriver = Map<
  eventListener<unknown>["name"],
  eventListener<unknown>["callback"]
>;

export default class EventBus {
  private static eventBus: Map<string, EventDriver> = new Map();

  public static removeEvent(event: string) {
    this.eventBus.delete(event) ??
      EngineDebugger.showError(`No event with name ${event} to delete`);
  }
  public static removeFromEvent(event: string, name: string) {
    const bus = this.eventBus.get(event);
    if (!bus) {
      EngineDebugger.showError(`No event with name ${event} to delete from`);
      return;
    }
    bus.delete(name) ??
      EngineDebugger.showError(
        `No callback with name ${name} to delete in event: ${event}`
      );
  }

  public static on<T extends unknown>(
    event: string,
    listener: eventListener<T>
  ) {
    if (!this.eventBus.has(event)) this.eventBus.set(event, new Map());
    this.eventBus
      .get(event)!
      .set(listener.name, (e: T) => listener.callback(e));
  }
  public static async emitAwait<T extends unknown>(
    eventName: string,
    options?: T
  ) {
    const events = this.eventBus.get(eventName);
    if (!events) {
      EngineDebugger.showWarn(`No event with name ${eventName} to emit`);
      return;
    }
    await Promise.all(
      [...events.values()].map((event) => event(options as unknown))
    );
  }
  public static emit<T extends unknown>(event: string, options?: T) {
    this.eventBus
      .get(event)
      ?.forEach((listener) => listener(options as unknown));
  }
}
