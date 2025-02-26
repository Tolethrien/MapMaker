import EngineDebugger from "@/engine/core/modules/debugger";

type eventListener = {
  name: string;
  callback: (e: never) => void;
};
type EventDriver = Map<eventListener["name"], eventListener["callback"]>;

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

  public static on(event: string, listener: eventListener) {
    if (!this.eventBus.has(event)) this.eventBus.set(event, new Map());
    this.eventBus.get(event)!.set(listener.name, (e) => listener.callback(e));
  }

  public static emit<T extends unknown>(event: string, options?: T) {
    this.eventBus.get(event)?.forEach((listener) => listener(options as never));
  }
}
