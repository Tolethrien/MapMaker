import EntityManager from "@/engine/core/entitySys/entityManager";
import Button from "../reusable/button";
import { createNewEmptyChunk } from "@/API/project";
import GlobalStore from "@/engine/core/modules/globalStore/globalStore";
import { ProjectConfig } from "@/engine/core/entitySys/entityMan";

export default function LeftBar() {
  return (
    <div class="flex justify-center items-center flex-col min-w-32 bg-main-2">
      <p>add chunk</p>
      <div class="flex flex-col justify-center items-center">
        <Button
          name="N"
          onClick={async () => {
            console.log("dodaje chunk");
            const a = await createNewEmptyChunk("N");
            console.log(a);
          }}
        />
        <div>
          <Button
            name="W"
            onClick={async () => {
              console.log("dodaje chunk");
              const a = await createNewEmptyChunk("W");
              console.log(a);
            }}
          />
          <Button
            name="E"
            onClick={async () => {
              console.log("dodaje chunk");
              const a = await createNewEmptyChunk("E");
              console.log(a);
            }}
          />
        </div>
        <Button
          name="S"
          onClick={async () => {
            console.log("dodaje chunk");
            const a = await createNewEmptyChunk("S");
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
            console.log(EntityManager.getEntityPool());
          }}
        />
        <Button
          name="show meta"
          onClick={async () => {
            console.log(EntityManager.getAllLoadedChunksMeta());
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
