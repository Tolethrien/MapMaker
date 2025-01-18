import SpinnerSVG from "@/assets/icons/spinner";
import { Accessor, Show } from "solid-js";

interface Props {
  onClick: () => void;
  name: string;
  disabled?: Accessor<boolean>;
  loading?: Accessor<boolean>;
  style?: string;
}
export default function Button(props: Props) {
  const isDisable = props.disabled ?? (() => false);
  const isLoading = props.loading ?? (() => false);
  return (
    <button
      onClick={() => props.onClick()}
      disabled={isDisable()}
      class={`px-4 py-1  bg-app-main-3 text-app-acc-wheat border-1 border-app-acc-gray rounded-md shadow-lg hover:border-app-acc-ice outline-none ${props.style}`}
    >
      <Show
        when={!isLoading()}
        fallback={
          <div class="flex items-center gap-2 justify-center">
            <SpinnerSVG style="w-5 h-5 animate-spin" />
            <span>Loading...</span>
          </div>
        }
      >
        {props.name}
      </Show>
    </button>
  );
}
