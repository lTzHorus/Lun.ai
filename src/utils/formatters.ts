export function formatBRL(value: number): string {
  if (value === undefined || value === null || isNaN(value)) {
    return 'R$ 0,00';
  }
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absValue);

  return isNegative ? `-R$ ${formatted}` : `R$ ${formatted}`;
}

export function parseBRLInput(valueStr: string): number {
  if (!valueStr) return 0;
  // Remove R$, spaces, convert dot to nothing if thousands separator, comma to dot
  let cleaned = valueStr.replace(/R\$\s?/gi, '').replace(/\s/g, '');
  if (cleaned.includes(',') && cleaned.includes('.')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    cleaned = cleaned.replace(',', '.');
  }
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
