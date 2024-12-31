export const joinPaths = (...paths: string[]) => paths.join("\\");
export const randomColor = (): HSLA => [
  Math.round(Math.random() * 256),
  Math.round(Math.random() * 256),
  Math.round(Math.random() * 256),
  255,
];
