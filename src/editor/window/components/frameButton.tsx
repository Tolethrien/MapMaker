import { Show, useContext } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { FrameButtonTypes, FrameContext } from "../../providers/frame";

interface Props {
  children?: JSX.Element;
  name: FrameButtonTypes;
}
export default function FrameButton(props: Props) {
  const context = useContext(FrameContext)!;

  const changeOnActiveAndEnter = () => {
    if (
      context.getActiveButton() !== "none" &&
      context.getActiveButton() !== props.name
    )
      context.setActiveButton(props.name);
  };

  return (
    <button
      class={`px-4 text-app-acc-wheat app-prevent-drag outline-none text-sm  relative hover:bg-app-bg-4 ${
        context.getActiveButton() === props.name && "bg-app-bg-4"
      }`}
      onMouseEnter={changeOnActiveAndEnter}
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
