import { Accessor, Show } from "solid-js";

interface Props {
  onClick: () => void;
  name: string;
  disabled?: boolean;
  loading?: Accessor<boolean>;
}
export default function Button({
  name,
  onClick,
  disabled = false,
  loading = () => false,
}: Props) {
  return (
    <button
      onClick={() => onClick()}
      disabled={disabled}
      class="px-4 py-1  bg-main-3 text-wheat border-2 border-main-4 rounded-md shadow-md hover:border-wheat outline-none "
    >
      <Show when={!loading()} fallback={"Loading..."}>
        {name}
      </Show>
    </button>
  );
}
