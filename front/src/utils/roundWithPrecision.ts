export function roundWithPrecision(amount: number, precision: number) {
  const factor = Math.pow(10, precision);
  return Math.round(amount * factor) / factor;
}
