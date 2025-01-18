interface Props {
  style?: string;
}
export default function NameSVG(props: Props) {
  return (
    <svg
      width="50"
      height="50"
      viewBox="0 0 50 50"
      xmlns="http://www.w3.org/2000/svg"
      class={props.style}
      fill="#CCD6F6"
    >
      <path d="M45 9.98749H42.5V14H46V36H42.5V39.9875H45C47.7575 39.9875 50 37.745 50 34.9875V14.9875C50 12.2325 47.755 9.98749 45 9.98749ZM10 21H32.5L32.4875 29H10V21Z" />
      <path d="M37.5 39.9875V5H44.9875V0H24.9875V5H32.5V9.9875H5C2.2425 9.9875 0 12.23 0 14.9875V34.9875C0 37.745 2.2425 39.9875 5 39.9875H32.5V45H24.9875V50H44.9875V45H37.5V39.9875ZM4 36V14H32.5V36H4Z" />
    </svg>
  );
}
