type GroupItem = { itemCode: string; itemName: string; quantity: number };
type GroupDates = { sessionYear: string; orderPlacedDate: string; orderReceivedDate: string; expectedDeliveryDate: string; notes?: string };
export async function createDirectGroupOrder(locationId: number, ptCodes: string[], items: GroupItem[], input: GroupDates): Promise<never> {
  throw new Error("Create descriptive group orders from the Create Order screen.");
}
