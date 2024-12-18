import { JSX } from "solid-js/jsx-runtime";

interface Props {
  children?: JSX.Element;
}
export default function ContextMenu(props: Props) {
  return (
    <div class="absolute bg-slate-700 z-10 shadow-md rounded">
      {props.children}
    </div>
  );
}
