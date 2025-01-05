interface Props {
  style?: string;
}
export default function ArrowSVG(props: Props) {
  return (
    <svg
      width="109"
      height="109"
      viewBox="0 0 109 109"
      fill="black"
      xmlns="http://www.w3.org/2000/svg"
      class={props.style}
    >
      <path d="M9 100L17.6603 85H0.339746L9 100ZM9 0L0.339746 15H17.6603L9 0ZM10.5 86.5L10.5 13.5H7.5L7.5 86.5H10.5Z" />
      <path d="M9 100L24 108.66V91.3397L9 100ZM109 100L94 91.3397V108.66L109 100ZM22.5 101.5H95.5V98.5H22.5V101.5Z" />
    </svg>
  );
}
