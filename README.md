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

### Prerequisites

- Git
- Node.js 22 LTS and npm
- PostgreSQL with a running server
- Network access to Firebase project `system-order-34c0a`

### Fresh clone

1. Clone the repository and enter it:

```bash
git clone <repository-url>
cd order
```

2. Install the exact dependency versions from the lockfile:

```bash
npm ci
```

3. Create the PostgreSQL database:

```sql
CREATE DATABASE school_order_management;
```

4. Copy `.env.example` to `.env`. On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Update `DATABASE_URL` in `.env` if the PostgreSQL username, password, host, port, or database name differs from the example.

5. Apply the committed database migrations:

```bash
npm run prisma:deploy
```

6. Import shared schools, vendors, and items from Firebase Data Connect:

```bash
npm run master-data:sync
```

The import order is significant: schools must exist before bookseller-school mappings are created. The import commands replace the local school, vendor, and item master tables.

`schools:sync` always imports the shared Firebase/Data Connect organisations and their PT codes. Local Organisation records are not used for this shared master-data import, so they cannot prevent bookseller-to-school mappings from being created.

7. Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

8. Verify the Organisations, Schools, Vendors, Items, Create Order, Orders, and Reports/Search pages. Create one test order to verify local PostgreSQL writes.

### Optional data workflows

To install demo schools, vendors, items, and orders instead of shared master data, run:

```bash
npm run prisma:seed
```

The seed command deletes existing application data before inserting demo records. Do not run it against a database containing data you need.

`npm run organisations:sync` is a separate Google Sheets-to-local-PostgreSQL import. It requires `GOOGLE_SHEETS_ID`, `GOOGLE_SHEETS_RANGE`, Google Application Default Credentials, and read access to the spreadsheet. It is not required for the normal Firebase Data Connect setup above.

The shared imports are also available through replace buttons on the Schools, Vendors, and Items pages. Each clone uses its own PostgreSQL database from `DATABASE_URL`; Git never transfers PostgreSQL contents or `.env` secrets.

### Production check

Before handing off a clone, verify a production build:

```bash
npm run build
npm start
```

## Important Files

- `prisma/schema.prisma` - database schema and enum/table mapping.
- `prisma/migrations/202605180001_init/migration.sql` - initial PostgreSQL migration.
- `lib/services/orders.ts` - reusable business logic for creation, locking, finalization, status, revision, and search.
- `lib/validation/orders.ts` - Zod validation for Sheet 1, 2A, 2B1, 2B2, and finalization fields.
- `components/orders/create-order-form.tsx` - step-based creation flow.
- `app/orders/[id]/page.tsx` - workflow-specific order details page.

## Authentication

The project includes a login-ready structure and a stub current user in `lib/auth.ts`. Replace this with NextAuth, custom sessions, or your preferred provider when real authentication is required.
