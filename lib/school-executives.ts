import { distinctEndUsers, type EndUser } from "./end-user-type";
import type { CreateOrderInput } from "./validation/orders";

export function applyExecutiveToSelectedSchools(
  assignments: NonNullable<CreateOrderInput["schoolExecutives"]>,
  schools: EndUser[],
  executive: { incumbentCode: string; name: string }
) {
  const selected = distinctEndUsers(schools);
  const selectedCodes = new Set(selected.map(school => school.schoolCode));
  return [
    ...assignments.filter(assignment => !selectedCodes.has(assignment.schoolCode)),
    ...selected.map(school => ({
      schoolCode: school.schoolCode,
      incumbentCode: executive.incumbentCode,
      name: executive.name,
      updateDefault: true
    }))
  ];
}
