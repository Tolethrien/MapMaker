interface Props {
  style?: string;
}
export default function SpinnerSVG(props: Props) {
  return (
    <svg
      width="50"
      height="50"
      viewBox="0 0 50 50"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
      class={props.style}
    >
      <path d="M25 12C26.1046 12 27 11.1046 27 10C27 8.89543 26.1046 8 25 8C23.8954 8 23 8.89543 23 10C23 11.1046 23.8954 12 25 12Z" />
      <path
        opacity="0.3"
        d="M25 42C26.1046 42 27 41.1046 27 40C27 38.8954 26.1046 38 25 38C23.8954 38 23 38.8954 23 40C23 41.1046 23.8954 42 25 42Z"
      />
      <path
        opacity="0"
        d="M32.5 14C33.6046 14 34.5 13.1046 34.5 12C34.5 10.8954 33.6046 10 32.5 10C31.3954 10 30.5 10.8954 30.5 12C30.5 13.1046 31.3954 14 32.5 14Z"
      />
      <path
        opacity="0.3"
        d="M17.5 40C18.6046 40 19.5 39.1046 19.5 38C19.5 36.8954 18.6046 36 17.5 36C16.3954 36 15.5 36.8954 15.5 38C15.5 39.1046 16.3954 40 17.5 40Z"
      />
      <path
        opacity="0.93"
        d="M17.5 14C18.6046 14 19.5 13.1046 19.5 12C19.5 10.8954 18.6046 10 17.5 10C16.3954 10 15.5 10.8954 15.5 12C15.5 13.1046 16.3954 14 17.5 14Z"
      />
      <path
        opacity="0.3"
        d="M32.5 40C33.6046 40 34.5 39.1046 34.5 38C34.5 36.8954 33.6046 36 32.5 36C31.3954 36 30.5 36.8954 30.5 38C30.5 39.1046 31.3954 40 32.5 40Z"
      />
      <path
        opacity="0.65"
        d="M10 27C11.1046 27 12 26.1046 12 25C12 23.8954 11.1046 23 10 23C8.89543 23 8 23.8954 8 25C8 26.1046 8.89543 27 10 27Z"
      />
      <path
        opacity="0"
        d="M40 27C41.1046 27 42 26.1046 42 25C42 23.8954 41.1046 23 40 23C38.8954 23 38 23.8954 38 25C38 26.1046 38.8954 27 40 27Z"
      />
      <path
        opacity="0.86"
        d="M12 19.5C13.1046 19.5 14 18.6046 14 17.5C14 16.3954 13.1046 15.5 12 15.5C10.8954 15.5 10 16.3954 10 17.5C10 18.6046 10.8954 19.5 12 19.5Z"
      />
      <path
        opacity="0"
        d="M38 34.5C39.1046 34.5 40 33.6046 40 32.5C40 31.3954 39.1046 30.5 38 30.5C36.8954 30.5 36 31.3954 36 32.5C36 33.6046 36.8954 34.5 38 34.5Z"
      />
      <path
        opacity="0.44"
        d="M12 34.5C13.1046 34.5 14 33.6046 14 32.5C14 31.3954 13.1046 30.5 12 30.5C10.8954 30.5 10 31.3954 10 32.5C10 33.6046 10.8954 34.5 12 34.5Z"
      />
      <path
        opacity="0"
        d="M38 19.5C39.1046 19.5 40 18.6046 40 17.5C40 16.3954 39.1046 15.5 38 15.5C36.8954 15.5 36 16.3954 36 17.5C36 18.6046 36.8954 19.5 38 19.5Z"
      />
    </svg>
  );
}