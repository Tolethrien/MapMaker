import { Show, useContext } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { FrameButtonTypes, FrameContext } from "../context/provider";

interface Props {
  children?: JSX.Element;
  name: FrameButtonTypes;
}
const BUTTON_CLASS =
  "px-4 text-wheat app-prevent-drag outline-none text-sm  relative hover:bg-gray-500";
export default function FrameButton(props: Props) {
  const context = useContext(FrameContext);

  const changeOnActiveAndENter = () => {
    if (
      context.getActiveButton() !== "none" &&
      context.getActiveButton() !== props.name
    )
      context.setActiveButton(props.name);
  };

  return (
    <button
      class={`${BUTTON_CLASS} ${
        context.getActiveButton() === props.name
          ? "bg-gray-500"
          : "bg-slate-600"
      }`}
      onMouseEnter={changeOnActiveAndENter}
      onClick={() => context.setActiveButton(props.name)}
      onBlur={() => context.setActiveButton("none")}
    >
      {props.name}
      <Show when={context.getActiveButton() === props.name}>
        {props.children}
      </Show>
    </button>
  );
}
