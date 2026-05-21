export function displayOrderNo(orderNo: number, subOrderNo: number): string {
  return subOrderNo > 0 ? `${orderNo}.${subOrderNo}` : String(orderNo);
}

export function parseDisplayOrderNo(value: string): {
  orderNo?: number;
  subOrderNo?: number;
} {
  const trimmed = value.trim();
  if (!trimmed) {
    return {};
  }

  const [orderNo, subOrderNo = "0"] = trimmed.split(".");
  const parsedOrderNo = Number(orderNo);
  const parsedSubOrderNo = Number(subOrderNo);

  if (!Number.isInteger(parsedOrderNo) || !Number.isInteger(parsedSubOrderNo)) {
    return {};
  }

  return { orderNo: parsedOrderNo, subOrderNo: parsedSubOrderNo };
}
