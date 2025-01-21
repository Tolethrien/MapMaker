interface Props {
  style?: string;
}
export default function AddSVG(props: Props) {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      stroke="#CCD6F6"
      stroke-width="5"
      stroke-linejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      class={props.style}
    >
      <path d="M48.8333 3H7.16667C4.86548 3 3 4.86548 3 7.16667V48.8333C3 51.1345 4.86548 53 7.16667 53H48.8333C51.1345 53 53 51.1345 53 48.8333V7.16667C53 4.86548 51.1345 3 48.8333 3Z" />
      <path d="M28 16.8889V39.1111M16.8889 28H39.1111" stroke-linecap="round" />
    </svg>
  );
}
