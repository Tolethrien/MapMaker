import { JSX } from "solid-js/jsx-runtime";
import { Accessor, createContext, createSignal, Setter } from "solid-js";
import EventBus from "@/engine/core/modules/eventBus/eventBus";
interface Props {
  children: JSX.Element;
}
type Selectors = "tile" | "grid" | "layer";

interface GlobalContextSchema {
  isLeftBarVisible: Accessor<boolean>;
  setIsLeftBarVisible: Setter<boolean>;
  isRightBarVisible: Accessor<boolean>;
  setIsRightBarVisible: Setter<boolean>;
  isEngineInit: Accessor<boolean>;
  setIsEngineInit: Setter<boolean>;
  activeSelector: Accessor<Selectors>;
  setActiveSelector: Setter<Selectors>;
}
export const globalContext = createContext<GlobalContextSchema>();

export function GlobalProvider(props: Props) {
  const [isLeftBarVisible, setIsLeftBarVisible] = createSignal<boolean>(true);
  const [isRightBarVisible, setIsRightBarVisible] = createSignal<boolean>(true);
  const [isEngineInit, setIsEngineInit] = createSignal<boolean>(false);
  const [activeSelector, setActiveSelector] = createSignal<Selectors>("tile");

  EventBus.on("engineInit", {
    name: "setSolidStore",
    callback: () => setIsEngineInit(true),
  });
  return (
    <globalContext.Provider
      value={{
        isEngineInit,
        isLeftBarVisible,
        isRightBarVisible,
        setIsEngineInit,
        setIsLeftBarVisible,
        setIsRightBarVisible,
        activeSelector,
        setActiveSelector,
      }}
    >
      {props.children}
    </globalContext.Provider>
  );
}
