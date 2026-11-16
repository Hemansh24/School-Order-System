import { normalizeGroupCode } from './group-membership';

type School = { prCode: string; ptCode: string | null; groupCode: string | null };
export function planOrganisationGroupMappings(values: unknown[][], schools: School[], knownGroups: string[]) {
  const header = values[0]?.map(value => String(value ?? '').trim().toLowerCase());
  if (header?.[0] !== 'group/ngo code' || header[1] !== 'pt code' || header[2] !== 'pre_code') throw new Error('Expected Organisation headers: Group/NGO Code, PT Code, Pre_code.');
  const byPr = new Map(schools.map(school => [normalizeGroupCode(school.prCode), school]));
  const byPt = new Map(schools.filter(school => school.ptCode).map(school => [normalizeGroupCode(school.ptCode), school]));
  const seen = new Set<string>(), seenPt = new Set<string>();
  const errors: { row: number; prCode: string; message: string }[] = [];
  const unresolved: { row: number; prCode: string; groupCode: string }[] = [];
  const changes: { prCode: string; before: string | null; groupCode: string | null }[] = [];
  const known = new Set(knownGroups.map(normalizeGroupCode));
  let sourceRows = 0;
  values.slice(1).forEach((values, index) => {
    if (!values.some(value => String(value ?? '').trim())) return;
    sourceRows++;
    const row = index + 2, groupCode = normalizeGroupCode(String(values[0] ?? '')) || null;
    const ptCode = normalizeGroupCode(String(values[1] ?? '')), prCode = normalizeGroupCode(String(values[2] ?? ''));
    const fail = (message: string) => errors.push({ row, prCode, message });
    if (!/^PR\d+$/.test(prCode)) { fail('Invalid PR code.'); return; }
    if (seen.has(prCode)) fail('Duplicate PR code.');
    seen.add(prCode);
    if (ptCode && (!/^PT\d+$/.test(ptCode) || seenPt.has(ptCode))) fail('Invalid or duplicate PT code.');
    if (ptCode) seenPt.add(ptCode);
    if (groupCode && !(/^(GS\d+|C\d+\s*-\s*\d+|CS-\d+)$/.test(groupCode))) fail(`Malformed group code: ${groupCode}.`);
    const school = byPr.get(prCode);
    if (!school) { fail('PR code does not exist locally.'); return; }
    if (ptCode && ((school.ptCode && normalizeGroupCode(school.ptCode) !== ptCode) || (byPt.has(ptCode) && byPt.get(ptCode)?.prCode !== school.prCode))) fail(`PT identity conflict: source ${ptCode}, local ${school.ptCode ?? 'unassigned'}.`);
    if (groupCode && /^GS\d+$/.test(groupCode) && !known.has(groupCode)) unresolved.push({ row, prCode, groupCode });
    if (school.groupCode !== groupCode) {
      changes.push({ prCode: school.prCode, before: school.groupCode, groupCode });
    }
  });
  if (!sourceRows) throw new Error('Organisation mapping source is empty.');
  const invalidPr = new Set(errors.map(error => error.prCode));
  const validChanges = changes.filter(change => !invalidPr.has(normalizeGroupCode(change.prCode)));
  const added = validChanges.filter(change => change.groupCode && !change.before?.trim()).length;
  const changed = validChanges.filter(change => change.groupCode && change.before?.trim()).length;
  const cleared = validChanges.filter(change => !change.groupCode).length;
  return { sourceRows, added, changed, cleared, unchanged: values.slice(1).filter(row => row.some(value => String(value ?? '').trim()) && !invalidPr.has(normalizeGroupCode(String(row[2] ?? '')))).length - validChanges.length, errors, unresolved, absentFromSource: schools.filter(school => !seen.has(normalizeGroupCode(school.prCode))).map(school => school.prCode), changes: validChanges };
}
