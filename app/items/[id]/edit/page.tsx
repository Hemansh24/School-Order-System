import { notFound } from "next/navigation";
import { EditItemForm } from "@/components/reference/reference-forms";
import { ButtonLink, PageHeader } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditItemPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await prisma.item.findUnique({
    where: { itemId: Number(id) }
  });

  if (!item) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title="Edit Item"
        description="Update item details and whether the item is available for new order rows."
        action={<ButtonLink href="/items">Back to items</ButtonLink>}
      />
      <EditItemForm
        item={{
          itemId: item.itemId,
          itemCode: item.itemCode,
          itemName: item.itemName,
          itemType: item.itemType,
          subject: item.subject,
          classLevel: item.classLevel,
          publisher: item.publisher,
          price: item.price?.toString() ?? null,
          active: item.active
        }}
      />
    </>
  );
}

