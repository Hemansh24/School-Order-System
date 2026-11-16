import assert from 'node:assert/strict';
import test from 'node:test';
import { planOrganisationGroupMappings } from './organisation-group-mappings';
import { explicitGroupMembers } from './group-membership';

const headers = ['Group/NGO Code', 'PT Code', 'Pre_code'];
const schools = [
  { prCode: 'PR1', ptCode: 'PT1', groupCode: null },
  { prCode: 'PR2', ptCode: null, groupCode: 'GS2' }
];
test('imports PR/PT assignments and clears explicit blanks without changing identities', () => {
  const result = planOrganisationGroupMappings([headers, [' gs1 ', 'pt1', 'pr1'], ['', '', 'PR2']], schools, ['GS1']);
  assert.equal(result.errors.length, 0);
  assert.equal(result.added, 1); assert.equal(result.cleared, 1);
  assert.deepEqual(result.changes.map(change => change.groupCode), ['GS1', null]);
  assert.equal(schools[0].ptCode, 'PT1');
});
test('blank source PT preserves locally allocated PT and absent source schools remain untouched', () => {
  const result = planOrganisationGroupMappings([headers, ['GS1', '', 'PR1']], schools, ['GS1']);
  assert.equal(result.errors.length, 0); assert.deepEqual(result.absentFromSource, ['PR2']);
  assert.deepEqual(result.changes.map(change => change.prCode), ['PR1']);
});
test('duplicate PR rows, conflicting PT identities and malformed GS codes are blocking errors', () => {
  const result = planOrganisationGroupMappings([headers, ['GS1', 'PT9', 'PR1'], ['GSO198', '', 'PR2'], ['GS2', '', 'PR1']], schools, ['GS1']);
  assert.equal(result.errors.length, 3); assert.equal(result.changes.length, 0);
});
test('unknown schools are errors; missing GS masters remain unresolved without name inference', () => {
  const result = planOrganisationGroupMappings([headers, ['GS9', '', 'PR1'], ['GS1', '', 'PR99']], schools, []);
  assert.equal(result.errors.length, 1); assert.equal(result.unresolved[0].groupCode, 'GS9');
});
test('repeated mapping import is idempotent and blank assignments never imply membership', () => {
  const rows = [headers, ['GS1', '', 'PR1'], ['', '', 'PR2']];
  const first = planOrganisationGroupMappings(rows, schools, ['GS1']);
  const updated = schools.map(school => ({ ...school, groupCode: first.changes.find(change => change.prCode === school.prCode)?.groupCode ?? null }));
  assert.equal(planOrganisationGroupMappings(rows, updated, ['GS1']).changes.length, 0);
  assert.deepEqual(explicitGroupMembers(updated, ' gs1 ').map(row => row.prCode), ['PR1']);
});
