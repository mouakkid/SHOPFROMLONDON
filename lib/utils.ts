export const cn = (...classes: Array<string | undefined | false>) =>
  classes.filter(Boolean).join(" ");

export function currency(n: number | null | undefined): string {
  if (n == null) return "0.00";
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'MAD' }).format(n);
  } catch {
    return (n ?? 0).toFixed(2);
  }
}

export function monthKey(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2, '0')}`
}
