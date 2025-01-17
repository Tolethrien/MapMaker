interface Props {
  type: "error" | "info" | "success";
  style?: string;
}
import { Show } from "solid-js";
export default function NotificationSVG(props: Props) {
  return (
    <>
      <Show when={props.type === "error"}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 2C7.87827 2 5.84344 2.84285 4.34315 4.34315C2.84285 5.84344 2 7.87827 2 10C2 12.1217 2.84285 14.1566 4.34315 15.6569C5.84344 17.1571 7.87827 18 10 18C12.1217 18 14.1566 17.1571 15.6569 15.6569C17.1571 14.1566 18 12.1217 18 10C18 7.87827 17.1571 5.84344 15.6569 4.34315C14.1566 2.84285 12.1217 2 10 2ZM0 10C0 4.477 4.477 0 10 0C15.523 0 20 4.477 20 10C20 15.523 15.523 20 10 20C4.477 20 0 15.523 0 10ZM5.793 5.793C5.98053 5.60553 6.23484 5.50021 6.5 5.50021C6.76516 5.50021 7.01947 5.60553 7.207 5.793L10 8.586L12.793 5.793C12.8852 5.69749 12.9956 5.62131 13.1176 5.5689C13.2396 5.51649 13.3708 5.4889 13.5036 5.48775C13.6364 5.4866 13.7681 5.5119 13.891 5.56218C14.0139 5.61246 14.1255 5.68671 14.2194 5.7806C14.3133 5.8745 14.3875 5.98615 14.4378 6.10905C14.4881 6.23194 14.5134 6.36362 14.5123 6.4964C14.5111 6.62918 14.4835 6.7604 14.4311 6.8824C14.3787 7.00441 14.3025 7.11475 14.207 7.207L11.414 10L14.207 12.793C14.3892 12.9816 14.49 13.2342 14.4877 13.4964C14.4854 13.7586 14.3802 14.0094 14.1948 14.1948C14.0094 14.3802 13.7586 14.4854 13.4964 14.4877C13.2342 14.49 12.9816 14.3892 12.793 14.207L10 11.414L7.207 14.207C7.0184 14.3892 6.7658 14.49 6.5036 14.4877C6.2414 14.4854 5.99059 14.3802 5.80518 14.1948C5.61977 14.0094 5.5146 13.7586 5.51233 13.4964C5.51005 13.2342 5.61084 12.9816 5.793 12.793L8.586 10L5.793 7.207C5.60553 7.01947 5.50021 6.76516 5.50021 6.5C5.50021 6.23484 5.60553 5.98053 5.793 5.793Z"
            fill="#B94C4C"
          />
        </svg>
      </Show>
      <Show when={props.type === "info"}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 1.81818C8.92555 1.81818 7.86162 2.02981 6.86895 2.44099C5.87629 2.85216 4.97433 3.45483 4.21458 4.21458C3.45483 4.97433 2.85216 5.87629 2.44099 6.86895C2.02981 7.86162 1.81818 8.92555 1.81818 10C1.81818 11.0745 2.02981 12.1384 2.44099 13.131C2.85216 14.1237 3.45483 15.0257 4.21458 15.7854C4.97433 16.5452 5.87629 17.1478 6.86895 17.559C7.86162 17.9702 8.92555 18.1818 10 18.1818C12.17 18.1818 14.251 17.3198 15.7854 15.7854C17.3198 14.251 18.1818 12.17 18.1818 10C18.1818 7.83005 17.3198 5.74897 15.7854 4.21458C14.251 2.68019 12.17 1.81818 10 1.81818ZM0 10C0 4.47727 4.47727 0 10 0C15.5227 0 20 4.47727 20 10C20 15.5227 15.5227 20 10 20C4.47727 20 0 15.5227 0 10ZM10.9091 5V11.8182H9.09091V5H10.9091ZM9.09091 13.1818H10.9127V15.0036H9.09091V13.1818Z"
            fill="#EDC273"
          />
        </svg>
      </Show>
      <Show when={props.type === "success"}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M9.99998 0C4.47717 0 0 4.47717 0 9.99998C0 15.5228 4.47717 20 9.99998 20C15.5228 20 20 15.5228 20 9.99998C20 4.47717 15.5228 0 9.99998 0ZM9.99998 18C5.58881 18 2.00001 14.4112 2.00001 9.99998C2.00001 5.58876 5.58876 2.00001 9.99998 2.00001C14.4112 2.00001 18 5.58876 18 9.99998C18 14.4112 14.4112 18 9.99998 18ZM13.7657 6.42721L15.1798 7.84129L8.99999 14.047L5.29298 10.34L6.70701 8.92588L8.99999 11.2189L13.7657 6.42721Z"
            fill="#1A9246"
          />
        </svg>
      </Show>
    </>
  );
}