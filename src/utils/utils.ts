import { getAPI } from "@/preload/api/getAPI";

import Link from "./link";
import { Note } from "@/preload/globalLinks";

const { loadTexture } = getAPI("fileSystem");

export const joinPaths = (...paths: string[]) => paths.join("\\");
export const randomColor = (): HSLA => [
  Math.round(Math.random() * 256),
  Math.round(Math.random() * 256),
  Math.round(Math.random() * 256),
  255,
];
export const mapRange = (
  value: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number
) => {
  return (
    outputMin +
    ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin)
  );
};

export const clamp = (value: number, min: number, max: number) => {
  if (min === max) return min;
  else if (min > max) throw new Error("min is greater then max");
  else if (value <= min) return min;
  else if (value >= max) return max;
  return value;
};
export const convertTextures = async (
  textures: ProjectConfig["textureUsed"]
) => {
  const promises = textures.map(async (texture) => {
    const textureStatus = await loadTexture(texture.path);
    if (!textureStatus.success) {
      throw new Error(`error loading texture ${texture.path}`);
    }
    return textureStatus.src;
  });
  const results = await Promise.all(promises);
  return results.map((texture, index) => {
    return { name: textures[index].name, url: texture, id: textures[index].id };
  });
};

export const sendNotification = (note: Note) => {
  Link.set<Note[]>("notify")((prev) => [...prev, note]);
};
