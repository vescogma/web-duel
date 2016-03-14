export function roundTo(a, b) {
  const decimals = Math.pow(10, b);
  return Math.round(a * decimals) / decimals;
}

export function modulus(a, b) {
  return  ((a % b) + b) % b;
}