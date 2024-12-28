import { Accessor } from "solid-js";

interface Props {
  name: string;
  onClick: () => void;
  disable?: Accessor<boolean>;
}
export default function ContextButton(props: Props) {
  const isDisable = props.disable ?? (() => false);
  return (
    <div
      class={`whitespace-nowrap py-2 px-8  rounded ${
        isDisable() ? "brightness-50" : "hover:bg-main-4"
      }`}
      onClick={(e) => {
        if (isDisable()) return;
        e.stopPropagation();
        props.onClick();
      }}
    >
      {props.name}
    </div>
  );
}
