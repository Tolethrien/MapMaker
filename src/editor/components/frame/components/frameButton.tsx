import { Accessor, Setter, Show } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { ButtonTypes } from "../frame";

interface Props {
  setter: Setter<ButtonTypes>;
  getter: Accessor<ButtonTypes>;
  children?: JSX.Element;
  name: ButtonTypes;
}
const BUTTON_CLASS =
  "px-4 text-wheat app-prevent-drag outline-none text-sm  relative hover:bg-gray-500";
export default function FrameButton(props: Props) {
  const changeOnActiveAndENter = () => {
    if (props.getter() !== "none" && props.getter() !== props.name)
      props.setter(props.name);
  };

  return (
    <button
      class={`${BUTTON_CLASS} ${
        props.getter() === props.name ? "bg-gray-500" : "bg-slate-600"
      }`}
      onMouseEnter={changeOnActiveAndENter}
      onClick={() => props.setter(props.name)}
      onBlur={() => props.setter("none")}
    >
      {props.name}
      <Show when={props.getter() === props.name}>{props.children}</Show>
    </button>
  );
}
