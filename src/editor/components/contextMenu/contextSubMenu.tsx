import { createSignal, JSX, Show } from "solid-js";

interface Props {
  name: string;
  children?: JSX.Element;
}
export default function ContextSubMenu(props: Props) {
  const [isHover, setHover] = createSignal(false);

  return (
    <div
      class="whitespace-nowrap py-2 px-8 hover:bg-slate-600 relative rounded"
      onMouseEnter={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onMouseLeave={(e) => {
        e.stopPropagation();
        setHover(false);
      }}
    >
      {props.name}
      <Show when={isHover()}>
        <div class="absolute left-full -translate-x-1 top-0">
          {props.children}
        </div>
      </Show>
    </div>
  );
}
