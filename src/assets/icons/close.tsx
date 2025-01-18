interface Props {
  style?: string;
}
export default function CloseSVG(props: Props) {
  return (
    <svg
      width="51"
      height="51"
      viewBox="0 0 51 51"
      fill="#FFFED2"
      xmlns="http://www.w3.org/2000/svg"
      class={props.style}
    >
      <path d="M5.56616 50.0835L0.566162 45.0835L20.5662 25.0835L0.566162 5.0835L5.56616 0.0834961L25.5662 20.0835L45.5662 0.0834961L50.5662 5.0835L30.5662 25.0835L50.5662 45.0835L45.5662 50.0835L25.5662 30.0835L5.56616 50.0835Z" />
    </svg>
  );
}
