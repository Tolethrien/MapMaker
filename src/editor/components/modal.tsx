import { Accessor, createEffect, JSX, onCleanup } from "solid-js";

interface Props {
  open: Accessor<boolean>;
  children: JSX.Element;
}
export default function Modal(props: Props) {
  let ref!: HTMLDialogElement;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") event.preventDefault();
  };
  document.addEventListener("keydown", handleKeyDown);

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });

  createEffect(() => (props.open() ? ref.showModal() : ref.close()));
  //TODO: change dialog to just div as an "opened new window" and not actual modal
  return (
    <dialog
      class="backdrop:bg-black backdrop:opacity-80 focus:outline-none"
      ref={ref}
    >
      {props.children}
    </dialog>
  );
}
