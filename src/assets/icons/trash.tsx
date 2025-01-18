interface Props {
  style?: string;
}
export default function TrashSVG(props: Props) {
  return (
    <svg
      width="50"
      height="50"
      viewBox="0 0 50 50"
      fill="#CCD6F6"
      xmlns="http://www.w3.org/2000/svg"
      class={props.style}
    >
      <path d="M35 3.88889V6.66667H48.125C48.6223 6.66667 49.0992 6.84226 49.4508 7.15482C49.8025 7.46738 50 7.89131 50 8.33333C50 8.77536 49.8025 9.19928 49.4508 9.51185C49.0992 9.82441 48.6223 10 48.125 10H1.875C1.37772 10 0.900805 9.82441 0.549175 9.51185C0.197544 9.19928 0 8.77536 0 8.33333C0 7.89131 0.197544 7.46738 0.549175 7.15482C0.900805 6.84226 1.37772 6.66667 1.875 6.66667H15V3.88889C15 1.74222 16.96 0 19.375 0H30.625C33.04 0 35 1.74222 35 3.88889ZM18.75 3.88889V6.66667H31.25V3.88889C31.25 3.74155 31.1842 3.60024 31.0669 3.49605C30.9497 3.39187 30.7908 3.33333 30.625 3.33333H19.375C19.2092 3.33333 19.0503 3.39187 18.9331 3.49605C18.8158 3.60024 18.75 3.74155 18.75 3.88889ZM7.4925 13.7289C7.47113 13.5095 7.40104 13.296 7.28629 13.1008C7.17154 12.9056 7.0144 12.7326 6.82396 12.5917C6.63353 12.4508 6.41356 12.3448 6.17678 12.2799C5.94 12.2151 5.69111 12.1926 5.44448 12.2137C5.19785 12.2348 4.95839 12.2992 4.73992 12.4031C4.52146 12.507 4.32833 12.6484 4.17169 12.819C4.01506 12.9897 3.89803 13.1862 3.82736 13.3973C3.7567 13.6084 3.7338 13.8299 3.76 14.0489L7.29 46.4889C7.39558 47.4504 7.90002 48.3426 8.70507 48.9916C9.51012 49.6407 10.5581 50.0002 11.645 50H38.355C39.4423 50.0001 40.4906 49.6403 41.2957 48.9908C42.1008 48.3413 42.605 47.4486 42.71 46.4867L46.2425 14.0489C46.2902 13.6086 46.1393 13.1695 45.8228 12.8282C45.5063 12.4869 45.0503 12.2713 44.555 12.2289C44.0597 12.1865 43.5657 12.3207 43.1818 12.602C42.7978 12.8833 42.5552 13.2886 42.5075 13.7289L38.9775 46.1644C38.9626 46.302 38.8905 46.4296 38.7754 46.5225C38.6603 46.6153 38.5104 46.6668 38.355 46.6667H11.645C11.4896 46.6668 11.3397 46.6153 11.2246 46.5225C11.1095 46.4296 11.0374 46.302 11.0225 46.1644L7.4925 13.7289Z" />
      <path d="M18.0152 16.6689C18.2611 16.656 18.5075 16.6862 18.7403 16.758C18.973 16.8297 19.1876 16.9416 19.3717 17.0871C19.5558 17.2325 19.7059 17.4089 19.8133 17.6059C19.9207 17.803 19.9834 18.0169 19.9977 18.2356L21.2477 37.1244C21.2769 37.5662 21.1075 38.0001 20.7767 38.3308C20.4459 38.6615 19.9809 38.8618 19.484 38.8878C18.987 38.9137 18.4988 38.7631 18.1268 38.4691C17.7548 38.1751 17.5294 37.7617 17.5002 37.32L16.2502 18.4311C16.2357 18.2125 16.2697 17.9935 16.3505 17.7866C16.4312 17.5797 16.557 17.389 16.7207 17.2254C16.8843 17.0617 17.0827 16.9283 17.3044 16.8328C17.5261 16.7374 17.7668 16.6816 18.0127 16.6689H18.0152ZM33.7477 18.4311C33.7769 17.9894 33.6075 17.5554 33.2767 17.2247C32.9459 16.8941 32.4809 16.6937 31.984 16.6678C31.487 16.6418 30.9988 16.7925 30.6268 17.0865C30.2548 17.3805 30.0294 17.7938 30.0002 18.2356L28.7502 37.1244C28.721 37.5659 28.8903 37.9995 29.2209 38.33C29.5514 38.6605 30.0161 38.8607 30.5127 38.8867C31.0093 38.9126 31.4972 38.7621 31.869 38.4683C32.2408 38.1745 32.466 37.7614 32.4952 37.32L33.7477 18.4311Z" />
    </svg>
  );
}