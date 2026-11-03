// BS location and duplicate suffixes belong to the same bookseller code.
export function baseBsCode(code: string) {
  return code.trim().toUpperCase().match(/^BS-?(\d+)(?:-\d+)*$/)?.[1];
}

export function nextBsCode(codes: string[]) {
  const highest = codes.reduce((max, code) => Math.max(max, Number(baseBsCode(code) ?? 0)), 0);
  return `BS${String(highest + 1).padStart(5, "0")}`;
}

export function sameBsCode(left: string, right: string) {
  const leftNumber = baseBsCode(left);
  const rightNumber = baseBsCode(right);
  return leftNumber !== undefined && rightNumber !== undefined
    ? Number(leftNumber) === Number(rightNumber)
    : left.trim().toUpperCase() === right.trim().toUpperCase();
}
