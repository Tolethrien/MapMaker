import { JSX } from "solid-js/jsx-runtime";
import { Accessor, createContext, createSignal, Setter } from "solid-js";
interface Props {
  children: JSX.Element;
}

export interface GlobalContextSchema {
  isLeftBarVisible: Accessor<boolean>;
  setIsLeftBarVisible: Setter<boolean>;
  isRightBarVisible: Accessor<boolean>;
  setIsRightBarVisible: Setter<boolean>;
}
export const globalContext = createContext<GlobalContextSchema>();

export function GlobalProvider(props: Props) {
  const [isLeftBarVisible, setIsLeftBarVisible] = createSignal<boolean>(true);
  const [isRightBarVisible, setIsRightBarVisible] = createSignal<boolean>(true);

  return (
    <globalContext.Provider
      value={{
        isLeftBarVisible,
        isRightBarVisible,
        setIsLeftBarVisible,
        setIsRightBarVisible,
      }}
    >
      {props.children}
    </globalContext.Provider>
  );
}
