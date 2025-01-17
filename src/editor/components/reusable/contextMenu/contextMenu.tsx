import { JSX } from "solid-js/jsx-runtime";

interface Props {
  children?: JSX.Element;
}
export default function ContextMenu(props: Props) {
  return (
    <div class="absolute top-full bg-app-main-2 z-30 shadow-md rounded -translate-y-1 border-1 border-app-acc-gray">
      {props.children}
    </div>
  );
}
