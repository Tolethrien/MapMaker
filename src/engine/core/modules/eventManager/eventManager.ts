import { canvas } from "@/core/engine/engine";
import EngineDebugger from "../debugger/debbuger";

export type MouseEventType = (typeof MOUSE_EVENTS)[number];
export type KeyEventType = (typeof KEY_EVENTS)[number];
export type OtherEventType = (typeof OTHER_EVENTS)[number];
export type AllEventType = MouseEventType | KeyEventType | OtherEventType;
type eventListener = { name: string; callback: (e: never) => void };
type EventCallback<T extends AllEventType> = {
  name: string;
  callback: (options: EventPayloads[T]) => void;
};
type EventModifiers = { shift: boolean; alt: boolean; ctrl: boolean };
type KeyCallbackOptions = { key: string } & EventModifiers;
type MouseWheelOptions = { delta: number };
type MouseEventOptions = {
  x: number;
  y: number;
  button: number;
} & EventModifiers;
type resizeEventOptions = { currentSize: { x: number; y: number } };
type EventPayloads = {
  mouseMove: Omit<MouseEventOptions, "button">;
  mouseClick: Omit<MouseEventOptions, "button">;
  mouseClickOutside: Omit<MouseEventOptions, "button">;
  mouseOver: { x: number; y: number };
  mouseAuxClick: MouseEventOptions;
  mouseDown: MouseEventOptions;
  mouseUp: MouseEventOptions;
  mouseHold: MouseEventOptions;
  mouseWheel: MouseWheelOptions;
  keyDown: KeyCallbackOptions;
  keyUp: KeyCallbackOptions;
  keyHold: KeyCallbackOptions;
  resizeWindow: resizeEventOptions;
};
export const MOUSE_EVENTS = [
  "mouseMove",
  "mouseClick",
  "mouseAuxClick",
  "mouseOver",
  "mouseClickOutside",
  "mouseDown",
  "mouseUp",
  "mouseHold",
  "mouseWheel",
] as const;
//TODO: mouseDrag
export const KEY_EVENTS = ["keyDown", "keyUp", "keyHold"] as const;
export const OTHER_EVENTS = ["resizeWindow"] as const;

export default class EventManager {
  private static events: Map<
    AllEventType | string,
    Map<eventListener["name"], eventListener["callback"]>
  > = new Map();
  private static pressedKeys: Set<string> = new Set();
  private static holdKeys: Map<string, NodeJS.Timeout> = new Map();
  private static mouseHoldRefresh = 16;
  private static keyHoldRefresh = 16;
  private static mousePosition = { x: 0, y: 0 };

  public static get getMousePosition() {
    return this.mousePosition;
  }

  public static set setMouseHoldRefresh(ms: number) {
    this.mouseHoldRefresh = ms;
  }

  public static set setKeyHoldRefresh(ms: number) {
    this.keyHoldRefresh = ms;
  }

  private static eventsUpdate() {
    this.emit("mouseOver", {
      x: this.mousePosition.x,
      y: this.mousePosition.y,
    });
  }

  public static initialize() {
    [...KEY_EVENTS, ...MOUSE_EVENTS, ...OTHER_EVENTS].forEach((eventName) =>
      this.events.set(eventName, new Map())
    );
    this.createEvents();
  }

  public static on<T extends AllEventType>(
    event: T,
    listener: EventCallback<T>
  ) {
    this.events
      .get(event)!
      .set(listener.name, (e) => listener.callback(e as EventPayloads[T]));
  }

  public static off(event: AllEventType, listenerName: eventListener["name"]) {
    this.events.get(event)!.delete(listenerName);
  }

  private static emit<T extends AllEventType>(
    event: AllEventType,
    options: EventPayloads[T]
  ) {
    this.events.get(event)!.forEach((listener) => listener(options as never));
  }

  public static addCustom(event: string) {
    this.events.set(event, new Map());
  }

  public static removeCustom(event: string) {
    this.events.delete(event) ??
      EngineDebugger.showError(`No event with name ${event} to delete`);
  }

  public static onCustom(event: string, listener: eventListener) {
    this.events.get(event)?.set(listener.name, (e) => listener.callback(e)) ??
      EngineDebugger.showError(
        `No event with name ${event}. This is a custome event, make sure you register it first with 'addCustome'!`
      );
  }

  public static offCustom(event: string, listenerName: eventListener["name"]) {
    this.events.get(event)?.delete(listenerName) ??
      EngineDebugger.showError(
        `No event callback with name ${listenerName} in event: "${event}"`
      );
  }

  public static emitCustom<T extends unknown>(event: string, options?: T) {
    this.events.get(event)?.forEach((listener) => listener(options as never));
  }

  private static createEvents() {
    canvas.addEventListener("click", (e) => {
      const eventOptions = {
        x: e.offsetX,
        y: e.offsetY,
        alt: e.altKey,
        shift: e.shiftKey,
        ctrl: e.ctrlKey,
      };
      this.emit("mouseClick", eventOptions);
      this.emit("mouseClickOutside", eventOptions);
    });
    canvas.addEventListener("auxclick", (e) => {
      const eventOptions = {
        x: e.offsetX,
        y: e.offsetY,
        alt: e.altKey,
        shift: e.shiftKey,
        ctrl: e.ctrlKey,
      };
      this.emit("mouseAuxClick", eventOptions);
      this.emit("mouseClickOutside", eventOptions);
    });
    canvas.addEventListener("mousemove", (e) => {
      this.mousePosition = { x: e.offsetX, y: e.offsetY };
      this.emit("mouseMove", {
        x: e.offsetX,
        y: e.offsetY,
        alt: e.altKey,
        shift: e.shiftKey,
        ctrl: e.ctrlKey,
      });
    });
    canvas.addEventListener("mousedown", (e) => {
      this.emit("mouseDown", {
        x: e.offsetX,
        y: e.offsetY,
        button: e.button,
        alt: e.altKey,
        shift: e.shiftKey,
        ctrl: e.ctrlKey,
      });
    });
    canvas.addEventListener("mouseup", (e) => {
      this.emit("mouseUp", {
        x: e.offsetX,
        y: e.offsetY,
        button: e.button,
        alt: e.altKey,
        shift: e.shiftKey,
        ctrl: e.ctrlKey,
      });
    });
    canvas.addEventListener("wheel", (e) => {
      this.emit("mouseWheel", { delta: e.deltaY });
    });
    window.addEventListener("keydown", (e) => {
      if (this.pressedKeys.has(e.key)) return;
      this.pressedKeys.add(e.key);
      this.emit("keyDown", {
        key: e.key,
        alt: e.altKey,
        shift: e.shiftKey,
        ctrl: e.ctrlKey,
      });
    });
    window.addEventListener("keyup", (e) => {
      this.pressedKeys.delete(e.key);
      this.emit("keyUp", {
        key: e.key,
        alt: e.altKey,
        shift: e.shiftKey,
        ctrl: e.ctrlKey,
      });
    });
    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      this.emit("resizeWindow", {
        currentSize: { x: window.innerWidth, y: window.innerHeight },
      });
    });
    this.mouseHoldEvent();
    this.keyHoldEvent();
  }

  private static mouseHoldEvent() {
    let holdTime: NodeJS.Timeout | undefined;
    canvas.addEventListener("mousedown", (e) => {
      if (holdTime !== undefined) return;
      holdTime = setInterval(() => {
        this.emit("mouseHold", {
          x: e.offsetX,
          y: e.offsetY,
          button: e.button,
          alt: e.altKey,
          shift: e.shiftKey,
          ctrl: e.ctrlKey,
        });
      }, this.mouseHoldRefresh);
    });
    canvas.addEventListener("mouseup", () => {
      clearInterval(holdTime);
      holdTime = undefined;
    });
  }

  private static keyHoldEvent() {
    window.addEventListener("keydown", (e) => {
      if (this.holdKeys.has(e.key)) return;
      this.emit("keyHold", {
        key: e.key,
        alt: e.altKey,
        shift: e.shiftKey,
        ctrl: e.ctrlKey,
      });
      this.holdKeys.set(
        e.key,
        setInterval(
          () =>
            this.emit("keyHold", {
              key: e.key,
              alt: e.altKey,
              shift: e.shiftKey,
              ctrl: e.ctrlKey,
            }),
          this.keyHoldRefresh
        )
      );
    });

    window.addEventListener("keyup", (e) => {
      const interval = this.holdKeys.get(e.key);
      if (!interval) return;
      clearInterval(interval);
      this.holdKeys.delete(e.key);
    });
  }
}
