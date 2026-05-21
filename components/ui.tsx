import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { displayOrderNo } from "@/lib/order-number";

export function PageHeader({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-ink">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-lg border border-line bg-white shadow-soft ${className}`}>
      {children}
    </section>
  );
}

export function ButtonLink(props: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={`focus-ring inline-flex h-10 items-center justify-center rounded-md bg-brand px-4 text-sm font-semibold text-ink transition hover:bg-brand-soft ${props.className ?? ""}`}
    />
  );
}

export function SubmitButton({
  children,
  variant = "primary",
  ...props
}: ComponentProps<"button"> & { variant?: "primary" | "secondary" | "danger" }) {
  const classes = {
    primary: "bg-brand text-ink hover:bg-brand-soft",
    secondary: "border border-line bg-white text-ink hover:bg-brand-soft",
    danger: "bg-danger text-ink hover:bg-red-100"
  };

  return (
    <button
      {...props}
      className={`focus-ring inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${classes[variant]} ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function StatusPill({ value }: { value: string }) {
  const tone =
    value === "finalized"
      ? "bg-ok text-green-900"
      : value === "locked" || value === "pending_confirmation"
        ? "bg-warn text-yellow-900"
        : value === "cancelled" || value === "on_hold"
          ? "bg-danger text-red-900"
          : "bg-brand-soft text-brand-dark";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {value.replaceAll("_", " ")}
    </span>
  );
}

export function OrderNumber({
  orderNo,
  subOrderNo
}: {
  orderNo: number;
  subOrderNo: number;
}) {
  return <span className="font-semibold text-ink">{displayOrderNo(orderNo, subOrderNo)}</span>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-white p-8 text-center text-sm text-muted">
      {children}
    </div>
  );
}
