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
