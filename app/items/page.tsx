import Link from "next/link";
import { Card, PageHeader, StatusPill } from "@/components/ui";
import { deleteItemAction, syncImportedItemsAction } from "@/app/items/actions";
import { InlineActionForm } from "@/components/inline-action-form";
import { AddItemForm } from "@/components/reference/reference-forms";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ItemsPage() {
  const items = await prisma.item.findMany({ orderBy: { itemName: "asc" } });

  return (
    <>
      <PageHeader
        title="Items"
        description="Books and related items available for order rows."
        action={
          <InlineActionForm action={syncImportedItemsAction}>
            Replace With Imported Items
          </InlineActionForm>
        }
      />
      <AddItemForm />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-canvas text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Sub-category</th>
                <th className="px-4 py-3">Customisation</th>
                <th className="px-4 py-3">Language</th>
                <th className="px-4 py-3">Edition</th>
                <th className="px-4 py-3">MRP</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((item) => (
                <tr key={item.itemId}>
                  <td className="px-4 py-3 font-semibold text-ink">{item.itemCode}</td>
                  <td className="px-4 py-3">{item.itemName}</td>
                  <td className="px-4 py-3 text-muted">
                    <span className="font-medium text-ink">{item.categoryCode}</span>
                    {item.categoryType ? <span className="block">{item.categoryType}</span> : null}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    <span className="font-medium text-ink">{item.subCategoryCode}</span>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    <span className="font-medium text-ink">{item.customisationName ?? item.customisationCode}</span>
                    <span className="block">{item.customisationCode}</span>
                  </td>
                  <td className="px-4 py-3 text-muted">{item.languageCode}</td>
                  <td className="px-4 py-3 text-muted">{item.editionCode}</td>
                  <td className="px-4 py-3 text-muted">{item.mrp?.toString()}</td>
                  <td className="px-4 py-3">
                    <StatusPill value={item.obsolete ? "obsolete" : item.active ? "active" : "inactive"} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/items/${item.itemId}/edit`}
                        className="font-semibold text-brand-dark"
                      >
                        Edit
                      </Link>
                      <InlineActionForm
                        action={deleteItemAction.bind(null, item.itemId)}
                        variant="danger"
                      >
                        Delete
                      </InlineActionForm>
                    </div>
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
