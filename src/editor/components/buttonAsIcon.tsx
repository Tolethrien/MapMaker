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
}
export default function IconButton(props: Props) {
  const isDisable = props.disabled ?? (() => false);
  const isLoading = props.loading ?? (() => false);
  const isActive = props.active ?? (() => false);
  return (
    <button
      onClick={() => props.onClick()}
      disabled={isDisable() || isLoading()}
      class={`p-1 w-fit h-fit hover:scale-110 ${props.style}`}
    >
      <Show
        when={!isLoading()}
        fallback={<SpinnerSVG style={`animate-spin ${props.spinnerStyle}`} />}
      >
        {props.children}
        {/* <img
          src={props.icon}
          alt="button icon"
          class="w-full h-full hover:scale-125"
        /> */}
      </Show>
    </button>
  );
}
