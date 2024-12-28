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
      class={`px-4 py-1  bg-main-3 text-wheat border-2 border-main-4 rounded-md shadow-md hover:border-wheat outline-none ${props.style}`}
    >
      <Show when={!isLoading()} fallback={"Loading..."}>
        {props.name}
      </Show>
    </button>
  );
}
