import { Accessor, JSX, Show } from "solid-js";
import SpinnerSVG from "@/assets/icons/spinner";
interface Props {
  onClick: () => void;
  disabled?: Accessor<boolean>;
  loading?: Accessor<boolean>;
  active?: Accessor<boolean>;
  style?: string;
  spinnerStyle?: string;
  children: JSX.Element;
  scale?: boolean;
}
export default function IconButton(props: Props) {
  const isDisable = props.disabled ?? (() => false);
  const isLoading = props.loading ?? (() => false);
  const isScalable = props.scale ?? true;
  return (
    <button
      onClick={() => props.onClick()}
      disabled={isDisable() || isLoading()}
      class={`p-1 w-fit h-fit ${isScalable && "hover:scale-110"} ${
        props.style
      }`}
    >
      <Show
        when={!isLoading()}
        fallback={<SpinnerSVG style={`animate-spin ${props.spinnerStyle}`} />}
      >
        {props.children}
      </Show>
    </button>
  );
}
