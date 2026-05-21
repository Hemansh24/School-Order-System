export type CurrentUser = {
  id: string;
  name: string;
  role: "operations" | "admin";
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  return {
    id: "stub-ops-user",
    name: "Operations User",
    role: "operations"
  };
}
