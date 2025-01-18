interface Props {
  style?: string;
}
export default function FolderSVG(props: Props) {
  return (
    <svg
      width="54"
      height="50"
      viewBox="0 0 54 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="#CCD6F6"
      stroke-width="4"
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.style}
    >
      <path d="M27 10.7143H49.2222C50.75 10.7143 52 12 52 13.5714V42.1428C52 43.7143 50.75 45 49.2222 45H4.77778C3.25 45 2 43.7143 2 42.1428V10.7143H27Z" />
      <path d="M27 10.7143H2V7.85714C2 6.28571 3.25 5 4.77778 5H21.4444L27 10.7143Z" />
    </svg>
  );
}
