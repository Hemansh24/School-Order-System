export function commissionLabel(value: {
  commissionPartyCode?: string | null;
  commissionPartyName?: string | null;
  commissionPbsCode?: string | null;
}) {
  return [value.commissionPartyCode, value.commissionPartyName, value.commissionPbsCode].filter(Boolean).join(" · ") || "—";
}
