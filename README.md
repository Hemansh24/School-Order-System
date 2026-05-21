# School Book Order Operations Dashboard

Next.js App Router application for school-book order processing with the required Order Sheet 1 -> 2A or 2B1/2B2 -> 3 workflow.

## Stack

- Next.js App Router, React, TypeScript
- Tailwind CSS custom UI
- PostgreSQL with Prisma migrations
- Zod validation on the server and React Hook Form validation on the client
- Server Actions for order mutations

## Workflow Rules Implemented

- Order numbers are stored as `order_no` and `sub_order_no`, never decimals.
- UI display uses `displayOrderNo(order_no, sub_order_no)`.
- Descriptive orders create only Order Sheet 2A rows.
- Ambiguous orders create only Order Sheet 2B1 school rows and 2B2 grouped item rows.
- Ambiguous quantities are not forced into school-wise allocations.
- Finalization creates Order Sheet 3 rows from either 2A or 2B2.
- Order Sheet 3 has its own `order_sheet_3_id`, plus `source_type` and `source_id`.
- Finalized orders are protected from direct status edits; revisions create a new sub-order.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from the example and point it to PostgreSQL:

```bash
cp .env.example .env
```

3. Run migrations and seed data:

```bash
npm run prisma:migrate
npm run prisma:seed
```

4. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Important Files

- `prisma/schema.prisma` - database schema and enum/table mapping.
- `prisma/migrations/202605180001_init/migration.sql` - initial PostgreSQL migration.
- `lib/services/orders.ts` - reusable business logic for creation, locking, finalization, status, revision, and search.
- `lib/validation/orders.ts` - Zod validation for Sheet 1, 2A, 2B1, 2B2, and finalization fields.
- `components/orders/create-order-form.tsx` - step-based creation flow.
- `app/orders/[id]/page.tsx` - workflow-specific order details page.

## Authentication

The project includes a login-ready structure and a stub current user in `lib/auth.ts`. Replace this with NextAuth, custom sessions, or your preferred provider when real authentication is required.
