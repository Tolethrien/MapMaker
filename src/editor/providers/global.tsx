import { JSX } from "solid-js/jsx-runtime";
import { Accessor, createContext, createSignal, Setter } from "solid-js";
interface Props {
  children: JSX.Element;
}

export interface GlobalContextSchema {}
export const globalContext = createContext<GlobalContextSchema>();
export function GlobalProvider(props: Props) {
  return (
    <globalContext.Provider value={{}}>{props.children}</globalContext.Provider>
  );
}
