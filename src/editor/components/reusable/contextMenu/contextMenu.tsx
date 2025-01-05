import { JSX } from "solid-js/jsx-runtime";

interface Props {
  children?: JSX.Element;
}
export default function ContextMenu(props: Props) {
  return (
    <div class="absolute top-full bg-app-bg-3 z-30 shadow-md rounded -translate-y-1 border-1 border-slate-700">
      {props.children}
    </div>
  );
}
