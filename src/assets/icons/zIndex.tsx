interface Props {
  style?: string;
}
export default function ZIndexSVG(props: Props) {
  return (
    <svg
      width="50"
      height="50"
      viewBox="0 0 50 50"
      fill="none"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      class={props.style}
    >
      <path d="M15.625 30.1289L7.54883 33.7529C5.83008 34.5342 5.83008 35.8135 7.54883 36.5947L22.002 43.1865C23.6514 43.9375 26.3662 43.9375 28.0156 43.1865L42.4688 36.5947C44.1875 35.8135 44.1875 34.5342 42.4688 33.7529L34.6621 29.9961M42.4609 13.4424L27.875 6.79199C26.2939 6.06934 23.7061 6.06934 22.125 6.79199L7.54883 13.4424C5.83008 14.2236 5.83008 15.502 7.54883 16.2832L22.002 22.875C23.6514 23.627 26.3662 23.627 28.0156 22.875L42.4688 16.2832C44.1797 15.502 44.1797 14.2227 42.4609 13.4424Z" />
      <path d="M15.625 19.9688L7.53906 23.5977C5.82031 24.3789 5.82031 25.6582 7.53906 26.4395L21.9922 33.0303C23.6416 33.7822 26.3564 33.7822 28.0059 33.0303L42.459 26.4395C44.1875 25.6582 44.1875 24.3789 42.4688 23.5977L34.375 19.9688" />
    </svg>
  );
}
