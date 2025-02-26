import { JSX } from "solid-js/jsx-runtime";

interface Props {
  children?: JSX.Element;
  bound?: "left" | "right";
}
export default function ContextMenu(props: Props) {
  const boundSide = props.bound ?? "left";
  return (
    <div
      class={`absolute top-full bg-app-main-2 z-30 shadow-md rounded -translate-y-1 border-1 border-app-acc-gray ${
        boundSide === "left" ? "left-0" : "right-0"
      }`}
    >
      {props.children}
    </div>
  );
}
