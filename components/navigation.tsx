import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Building2,
  ClipboardList,
  FileSearch,
  PackagePlus,
  School,
  UserRound
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/orders", label: "Orders", icon: ClipboardList },
  { href: "/orders/new", label: "Create Order", icon: PackagePlus },
  { href: "/schools", label: "Schools", icon: School },
  { href: "/vendors", label: "Vendors", icon: Building2 },
  { href: "/items", label: "Items", icon: BookOpen },
  { href: "/reports", label: "Reports/Search", icon: FileSearch }
];

export function Navigation() {
  return (
    <aside className="border-b border-line bg-white lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex h-16 items-center gap-3 border-b border-line px-5">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-brand text-sm font-bold text-ink">
          OS
        </div>
        <div>
          <p className="font-semibold text-ink">Order Sheets</p>
          <p className="text-xs text-muted">School book operations</p>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto p-3 lg:block lg:space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring flex min-w-max items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted transition hover:bg-brand-soft hover:text-ink"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="m-3 hidden rounded-lg border border-line bg-canvas p-3 text-sm text-muted lg:block">
        <div className="mb-2 flex items-center gap-2 font-semibold text-ink">
          <UserRound className="h-4 w-4" />
          Login-ready
        </div>
        Authentication is stubbed in <span className="font-mono">lib/auth.ts</span>.
      </div>
    </aside>
  );
}
