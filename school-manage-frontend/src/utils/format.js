export function formatCurrency(value) {
  const number = Number(value || 0);
  return `₹${number.toFixed(2)}`;
}
