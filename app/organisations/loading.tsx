import { Card, PageHeader } from "@/components/ui";

export default function OrganisationsLoading() {
  return (
    <>
      <PageHeader
        title="Organisations"
        description="Search, filter, and inspect organisation records synced into Cloud SQL PostgreSQL."
      />
      <Card className="mb-6 p-4">
        <div className="grid animate-pulse gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-3 w-24 rounded bg-canvas" />
              <div className="h-10 rounded-md bg-canvas" />
            </div>
          ))}
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="border-b border-line px-4 py-3">
          <div className="h-5 w-24 animate-pulse rounded bg-canvas" />
        </div>
        <div className="space-y-3 p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-md bg-canvas" />
          ))}
        </div>
      </Card>
    </>
  );
}
