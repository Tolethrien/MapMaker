export default class MathUtils {
  public static mapRange(
    value: number,
    inputMin: number,
    inputMax: number,
    outputMin: number,
    outputMax: number
  ) {
    return (
      outputMin +
      ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin)
    );
  };

  public static clamp(value: number, min: number, max: number) {
    if (min === max) return min;
    else if (min > max) throw new Error("min is greater then max");
    else if (value <= min) return min;
    else if (value >= max) return max;
    return value;
  };

  public static equalFloatErrorCheck(
    valueA: number,
    valueB: number
  ) {
    return Math.abs(valueA - valueB) < 0.0005;
  };

  public static normalizeColor(color: number[]) {
    return color.map((value) => value / 255);
  }

  public static randomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
