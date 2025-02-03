interface Props {
  style?: string;
}
export default function GridSVG(props: Props) {
  return (
    <svg
      width="50"
      height="50"
      viewBox="0 0 50 50"
      xmlns="http://www.w3.org/2000/svg"
      class={props.style}
    >
      <path
        d="M5 1.5H45C46.933 1.5 48.5 3.067 48.5 5V29V45C48.5 46.933 46.933 48.5 45 48.5H5C3.067 48.5 1.5 46.933 1.5 45V5C1.5 3.067 3.067 1.5 5 1.5Z"
        stroke-width="3"
        stroke="#CCD6F6"
      />
      <rect x="3" y="15" width="44" height="3" fill="#CCD6F6" />
      <rect x="3" y="30" width="44" height="3" fill="#CCD6F6" />
      <rect x="31" y="3" width="3" height="44" fill="#CCD6F6" />
      <rect x="15" y="3" width="3" height="44" fill="#CCD6F6" />
    </svg>
  );
}
