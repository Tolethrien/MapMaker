interface Props {
  name: string;
  onClick: () => void;
}
export default function ContextButton(props: Props) {
  return (
    <div
      class="whitespace-nowrap py-2 px-8 hover:bg-slate-600 rounded"
      onClick={(e) => {
        e.stopPropagation();
        props.onClick();
      }}
    >
      {props.name}
    </div>
  );
}
