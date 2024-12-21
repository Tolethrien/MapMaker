export default function Canvas() {
  return (
    <div class="flex flex-grow w-fit justify-center ">
      <canvas
        id="editorCanvas"
        width={600}
        height={600}
        class="border border-black w-[600px] h-[600px]"
      />
    </div>
  );
}
