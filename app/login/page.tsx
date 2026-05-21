import { Card, PageHeader, SubmitButton } from "@/components/ui";

export default function LoginPage() {
  return (
    <>
      <PageHeader
        title="Login"
        description="Authentication-ready page. The current implementation uses a stub user for operations access."
      />
      <Card className="max-w-md p-5">
        <form className="space-y-4">
          <label>
            <span className="mb-1 block text-xs font-semibold uppercase text-muted">Email</span>
            <input className="focus-ring h-10 w-full rounded-md border border-line bg-white px-3 text-sm" />
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold uppercase text-muted">Password</span>
            <input
              type="password"
              className="focus-ring h-10 w-full rounded-md border border-line bg-white px-3 text-sm"
            />
          </label>
          <SubmitButton type="button">Continue</SubmitButton>
        </form>
      </Card>
    </>
  );
}
