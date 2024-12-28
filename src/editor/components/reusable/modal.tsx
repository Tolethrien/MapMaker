import { Accessor, createEffect, JSX, onCleanup } from "solid-js";

interface Props {
  open: Accessor<boolean>;
  children: JSX.Element;
}
export default function Modal(props: Props) {
  let ref: HTMLDialogElement;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") event.preventDefault();
  };
  document.addEventListener("keydown", handleKeyDown);

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });

  createEffect(() => (props.open() ? ref.showModal() : ref.close()));
  return (
    <dialog
      class="backdrop:bg-gradient-to-br backdrop:from-teal-950 backdrop:to-indigo-950 backdrop:opacity-80 focus:outline-none"
      ref={ref}
    >
      {props.children}
    </dialog>
  );
}
