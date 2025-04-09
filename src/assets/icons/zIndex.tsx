interface Props {
  style?: string;
}
export default function ZIndexSVG(props: Props) {
  return (
    <svg
      width="54"
      height="54"
      viewBox="0 0 54 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="#CCD6F6"
      class={props.style}
    >
      <path
        d="M27 21.4444V2M27 2L35.3333 10.3333M27 2L18.6667 10.3333M27 32.5556V52M27 52L35.3333 43.6667M27 52L18.6667 43.6667M43.6667 2H46.4444C47.9179 2 49.3309 2.58532 50.3728 3.62718C51.4147 4.66905 52 6.08213 52 7.55556V46.4444C52 47.9179 51.4147 49.3309 50.3728 50.3728C49.3309 51.4147 47.9179 52 46.4444 52H43.6667M10.3333 2H7.55556C6.08213 2 4.66905 2.58532 3.62718 3.62718C2.58532 4.66905 2 6.08213 2 7.55556V46.4444C2 47.9179 2.58532 49.3309 3.62718 50.3728C4.66905 51.4147 6.08213 52 7.55556 52H10.3333"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
