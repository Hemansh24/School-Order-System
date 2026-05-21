import { Card, PageHeader, StatusPill } from "@/components/ui";
import { AddItemForm } from "@/components/reference/reference-forms";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ItemsPage() {
  const items = await prisma.item.findMany({ orderBy: { itemName: "asc" } });

  return (
    <>
      <PageHeader title="Items" description="Books and related items available for order rows." />
      <AddItemForm />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-canvas text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Publisher</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((item) => (
                <tr key={item.itemId}>
                  <td className="px-4 py-3 font-semibold text-ink">{item.itemCode}</td>
                  <td className="px-4 py-3">{item.itemName}</td>
                  <td className="px-4 py-3 text-muted">{item.itemType}</td>
                  <td className="px-4 py-3 text-muted">{item.subject}</td>
                  <td className="px-4 py-3 text-muted">{item.classLevel}</td>
                  <td className="px-4 py-3 text-muted">{item.publisher}</td>
                  <td className="px-4 py-3 text-muted">{item.price?.toString()}</td>
                  <td className="px-4 py-3">
                    <StatusPill value={item.active ? "active" : "inactive"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
