import { PageHeader } from "@/components/ui";
import { SchoolLookupForm } from "@/components/orders/school-lookup-form";

export const dynamic = "force-dynamic";

export default function SchoolLookupPage() {
  return (
    <>
      <PageHeader
        title="School Lookup"
        description="Create or reuse a PT/PR-backed school reference from the exact combination of name, address, district, state, and pincode."
      />
      <SchoolLookupForm />
    </>
  );
}
