import Tile from "@/engine/sandbox/entities/tile";
import Button from "../reusable/button";

export default function LeftBar() {
  return (
    <div class="flex justify-center items-center flex-col min-w-32">
      left bar
      <Button name="Click" onClick={() => new Tile()} />
    </div>
  );
}
