// Contact sources may contain several numbers, labels, and email addresses.
export function extractContactNumbers(value?: string | null): string[] {
  const withoutEmails = (value ?? "").replace(/\S+@\S+/g, "");
  const separated = withoutEmails.replace(/(\d{7,})\s+(?=\+?\d{7,})/g, "$1,");
  const candidates = separated.match(/\+?\d[\d\s().-]*\d/g) ?? [];
  const seen = new Set<string>();
  return candidates.map(number => number.trim()).filter(number => {
    const digits = number.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15 || seen.has(digits)) return false;
    seen.add(digits);
    return true;
  });
}
