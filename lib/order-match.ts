export function sameEndUsers(left: string[], right: string[]): boolean {
  const normalize = (codes: string[]) => [...new Set(codes.map(code => code.trim().toUpperCase()).filter(Boolean))].sort();
  const a = normalize(left);
  const b = normalize(right);
  return a.length === b.length && a.every((code, index) => code === b[index]);
}
