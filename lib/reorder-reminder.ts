export type ReorderReminder = {
  orderId: number;
  orderNo: number;
  createdAt: string;
  checkedAt: string;
};

export function isRecentReorder(reminder: ReorderReminder): boolean {
  const age = Date.parse(reminder.checkedAt) - Date.parse(reminder.createdAt);
  return age >= 0 && age <= 24 * 60 * 60 * 1000;
}

export function formatReorderCreatedAt(createdAt: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true
  }).format(new Date(createdAt)) + " IST";
}
