interface Props {
  style?: string;
}
export default function PickerSVG(props: Props) {
  return (
    <svg
      width="50"
      height="17"
      viewBox="0 0 50 17"
      fill="#CCD6F6"
      xmlns="http://www.w3.org/2000/svg"
      class={props.style}
    >
      <path d="M7.14286 16C11.0877 16 14.2857 12.866 14.2857 9C14.2857 5.13401 11.0877 2 7.14286 2C3.19797 2 0 5.13401 0 9C0 12.866 3.19797 16 7.14286 16Z" />
      <path d="M25 16C28.9449 16 32.1429 12.866 32.1429 9C32.1429 5.13401 28.9449 2 25 2C21.0551 2 17.8571 5.13401 17.8571 9C17.8571 12.866 21.0551 16 25 16Z" />
      <path d="M42.8572 16C46.802 16 50 12.866 50 9C50 5.13401 46.802 2 42.8572 2C38.9123 2 35.7143 5.13401 35.7143 9C35.7143 12.866 38.9123 16 42.8572 16Z" />
    </svg>
  );
}
