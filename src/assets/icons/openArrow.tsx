interface Props {
  style?: string;
}
export default function OpenArrowSVG(props: Props) {
  return (
    <svg
      width="56"
      height="50"
      viewBox="0 0 56 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="black"
      stroke-width="5"
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.style}
    >
      <path d="M3 38L28 13L53 38" />
    </svg>
  );
}
