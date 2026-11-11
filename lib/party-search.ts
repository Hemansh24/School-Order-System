type SearchableParty = {
  code: string;
  name: string;
  addressSummary?: string | null;
};

// Prepare once per query so both lookups use the same all-words matching.
export function createPartySearchMatcher(query: string) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);

  return (party: SearchableParty) => {
    const fields = [party.code, party.name, party.addressSummary ?? ""]
      .map(field => field.toLowerCase());
    return terms.every(term => fields.some(field => field.includes(term)));
  };
}
