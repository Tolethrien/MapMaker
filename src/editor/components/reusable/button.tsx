interface Props {
  onClick: () => void;
  name: string;
  disabled?: boolean;
}
export default function Button({ name, onClick, disabled = false }: Props) {
  return (
    <button
      onClick={() => onClick()}
      disabled={disabled}
      class="px-4 py-1  bg-gray-700 text-wheat border-2 border-gray-500 rounded-md shadow-md hover:border-wheat outline-none "
    >
      {name}
    </button>
  );
}
