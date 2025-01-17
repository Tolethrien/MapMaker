interface Props {
  checked: boolean;
  style?: string;
}
import { Show } from "solid-js";
export default function CheckboxSVG(props: Props) {
  return (
    <>
      <Show when={props.checked}>
        <svg
          width="17"
          height="17"
          viewBox="0 0 17 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.125 1H2.875C1.83947 1 1 1.83947 1 2.875V14.125C1 15.1605 1.83947 16 2.875 16H14.125C15.1605 16 16 15.1605 16 14.125V2.875C16 1.83947 15.1605 1 14.125 1Z"
            stroke="#B94C4C"
            stroke-width="2"
            stroke-linejoin="round"
          />
        </svg>
      </Show>
      <Show when={!props.checked}>
        <svg
          width="17"
          height="17"
          viewBox="0 0 17 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.25 5.375L7 11.625L4.75 9.125"
            stroke="#CCD6F6"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M14.125 1H2.875C1.83947 1 1 1.83947 1 2.875V14.125C1 15.1605 1.83947 16 2.875 16H14.125C15.1605 16 16 15.1605 16 14.125V2.875C16 1.83947 15.1605 1 14.125 1Z"
            stroke="#1A9246"
            stroke-width="2"
            stroke-linejoin="round"
          />
        </svg>
      </Show>
    </>
  );
}
