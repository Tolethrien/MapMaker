import Link from "./link";
import { Note, Selectors } from "@/preload/globalLinks";
import EntityManager from "@/engine/core/entitySystem/core/entityManager";

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

export const loadImage = (src: string) => {
  return new Promise<HTMLImageElement>((res, err) => {
    const img = new Image();
    img.src = src;
    img.onload = () => res(img);
    img.onerror = (error) => err(error);
  });
};
export const clamp = (value: number, min: number, max: number) => {
  if (min === max) return min;
  else if (min > max) throw new Error("min is greater then max");
  else if (value <= min) return min;
  else if (value >= max) return max;
  return value;
};

export const sendNotification = (note: Note) => {
  Link.set<Note[]>("notify")((prev) => [...prev, note]);
};
export const changeSelector = (selector: Selectors) => {
  const [get, set] = Link.getLink<Selectors>("activeSelector");
  if (get() === "grid") EntityManager.setFocusedChunk(undefined);
  set(selector);
};
