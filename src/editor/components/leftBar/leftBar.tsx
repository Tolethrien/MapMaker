import EntityManager, {
  ProjectConfig,
} from "@/engine/core/entitySystem/core/entityManager";
import Button from "../reusable/button";
import { createNewEmptyChunk } from "@/API/project";
import GlobalStore from "@/engine/core/modules/globalStore/globalStore";

export default function LeftBar() {
  GlobalStore.add("activeChunk", { x: 0, y: 0 });
  return (
    <div class="flex justify-center items-center flex-col min-w-32 bg-main-2">
      <p>add chunk</p>
      <div class="flex flex-col justify-center items-center">
        <Button
          name="N"
          onClick={async () => {
            console.log("dodaje chunk");
            const pos = EntityManager.getFocusedChunk.position;

            const a = await createNewEmptyChunk("N", pos);
            console.log(a);
          }}
        />
        <div>
          <Button
            name="W"
            onClick={async () => {
              console.log("dodaje chunk");
              const pos = EntityManager.getFocusedChunk.position;

              const a = await createNewEmptyChunk("W", pos);
              console.log(a);
            }}
          />
          <Button
            name="E"
            onClick={async () => {
              console.log("dodaje chunk");
              const pos = EntityManager.getFocusedChunk.position;

              const a = await createNewEmptyChunk("E", pos);
              console.log(a);
            }}
          />
        </div>
        <Button
          name="S"
          onClick={async () => {
            console.log("dodaje chunk");
            const pos = EntityManager.getFocusedChunk.position;
            const a = await createNewEmptyChunk("S", pos);
            console.log(a);
          }}
        />
      </div>
      <br />
      <br />
      <br />
      <div class="flex flex-col gap-4">
        <Button
          name="show ent"
          onClick={async () => {
            console.log(EntityManager.getAllChunks());
          }}
        />
        <Button
          name="show config"
          onClick={async () => {
            console.log(GlobalStore.get<ProjectConfig>("projectConfig")[0]);
          }}
        />
      </div>
    </div>
  );
}
