import { Show } from "solid-js";

interface Props {
  value?: string;
  onInput?: (
    e: InputEvent & {
      currentTarget: HTMLInputElement;
      target: HTMLInputElement;
    }
  ) => void;
  placeholder?: string;
  type?: "change" | "no-change";
}
export default function Input(props: Props) {
  const isNormal = props.type ?? "change";
  return (
    <Show
      when={isNormal === "change"}
      fallback={
        <input
          placeholder={props.placeholder ?? ""}
          value={props.value ?? ""}
          class="border-b-2 border-app-acc-wheat outline-none bg-transparent p-1"
          disabled
        ></input>
      }
    >
      <input
        onInput={(e) => props.onInput?.(e)}
        placeholder={props.placeholder ?? ""}
        value={props.value ?? ""}
        class="bg-app-main-3 rounded-md border-b-1 border-app-acc-ice shadow-inner outline-none pl-3 py-1"
      ></input>
    </Show>
  );
}
