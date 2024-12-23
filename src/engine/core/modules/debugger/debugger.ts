type Module =
  | "Dogma"
  | "NaviGPU"
  | "Engine"
  | "Aurora"
  | "Module"
  | "Store"
  | "dogmaUI"
  | (string & {});

interface Assert {
  msg?: string;
  module?: Module;
}

export default class EngineDebugger {
  private static timers: Map<string, number> = new Map();
  private static states: Map<string, unknown> = new Map();

  public static showError(msg: string, module: Module = "Module") {
    console.error(`Misa Error!\n${module} Error:\n${msg}`);
  }

  public static showWarn(msg: string, module: Module = "Module") {
    console.warn(`Misa Warn!\n${module} Warn:\n${msg}`);
  }

  public static programBreak(msg?: string) {
    throw new Error(msg ?? "Engine breaks on break command");
  }

  public static pauseCode(msg?: string) {
    console.warn(`debugger paused code with msg:\n ${msg ?? "no message"}`);
    debugger;
  }

  public static assertValue(
    value: unknown,
    options?: Assert & { varName?: string }
  ): asserts value {
    const msg = options?.msg ?? `value assertion failed`;
    const module = options?.module ?? "Module";
    const varName = options?.varName ?? "value";

    if (!value) {
      throw new TypeError(
        `Misa Error!\n${module} Assertion:\n${msg}\nAssertion failed: ${varName}=${value}`
      );
    }
  }

  public static assertCondition(
    condition: boolean,
    options?: Assert & { conditionToString?: string }
  ): asserts condition {
    const msg = options?.msg ?? `value assertion failed`;
    const module = options?.module ?? "Module";
    const conditionString = options?.conditionToString ?? "condition";

    if (!condition) {
      throw new TypeError(
        `Misa Error!\n${module} Assertion:\n${msg}\nAssertion failed: ${conditionString}=${condition}`
      );
    }
  }

  public static showInfo(msg: string, module: Module = "Module") {
    console.info(`Misa Info!\n${module} Info:\n${msg}`);
  }

  public static startTimer(label: string) {
    EngineDebugger.timers.set(label, performance.now());
  }

  public static endTimer(label: string) {
    const start = EngineDebugger.timers.get(label);
    if (!start) {
      console.warn(`Timer [${label}] not found.`);
      return;
    }
    const duration = performance.now() - start;
    console.info(`Timer [${label}]: ${duration.toFixed(2)} ms`);
    EngineDebugger.timers.delete(label);
  }

  public static trackerStateSet(label: string, state: unknown) {
    EngineDebugger.states.set(label, state);
    console.info(`State tracked [${label}]:`, state);
  }

  public static trackerStateDelete(label: string) {
    EngineDebugger.states.delete(label);
    console.info(`State deleted [${label}]:`);
  }

  public static trackerStateGet(label: string): unknown {
    return EngineDebugger.states.get(label);
  }

  public static trackerStateLogAll() {
    const arr = Array.from(EngineDebugger.states.entries());
    arr.length === 0
      ? console.info("trackerStateLogAll: Nothing to track")
      : console.table(arr);
  }
}
