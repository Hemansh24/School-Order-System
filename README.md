# School Book Order Operations Dashboard

Next.js App Router application for school-book order processing with the required Order Sheet 1 -> descriptive school/group or ambiguous entry -> Order Sheet 3 workflow.

## Stack

- Next.js App Router, React, TypeScript
- Tailwind CSS custom UI
- PostgreSQL with Prisma migrations
- Zod validation on the server and React Hook Form validation on the client
- Server Actions for order mutations

## Workflow Rules Implemented

- Each order uses one stable `order_no`; editing it before finalization never changes that number.
- Descriptive orders create only Order Sheet 2A rows.
- Ambiguous orders create only Order Sheet 2B2 item quantities; older school links remain hidden historical data.
- Ambiguous quantities are not forced into school-wise allocations.
- Finalization creates Order Sheet 3 rows from either 2A or 2B2.
- Order Sheet 3 has its own `order_sheet_3_id`, plus `source_type` and `source_id`.
- Finalized orders are protected from direct edits.
- **Place Reorder** on a normal order opens a new order with the same billing, end users, executives, commission, contacts, and order notes. Select fresh items and quantities; shipping and expected delivery can change. Saving assigns a new order number and draft status, links to the original order, and sets placed/received dates to today in India and the session to the current session. Fulfillment records are not copied. Group reporting containers and legacy direct group orders cannot be reordered; reorder their normal PT orders separately.

## Setup

### School executives

Descriptive orders support one optional Executive per end school in Sheet 2, including
individual, multiple-school, and group entries. Search by name or incumbent code, or
enter a custom name. Saving a changed or cleared assignment also updates the school's
default for future orders. Existing order assignments preserve their saved names.
Defaults use PR identity and survive school master refreshes and PT conversion.

After applying migrations, import the Adv-Ambassadors directory into local Postgres:

```powershell
npm run executives:import
npm run executives:import -- --apply
```

The first command previews; the second upserts by incumbent code without deleting
existing executives. This uses Google Sheets read credentials, with optional
`EXECUTIVES_SHEET_ID` and `EXECUTIVES_SHEET_RANGE` overrides. For a connector export,
pass `--file <path.json>` containing a rows array or `{ "values": [...] }`, including
the source headers. The entire input is validated before database writes. Custom
names remain assignments and do not create directory entries. Imports are manual.

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

The import order is significant: schools must exist before bookseller-school mappings are created. The import commands replace the local organisation, school, vendor, and item master tables. These Firebase imports require no Google Sheets credentials, but the GS refresh at the end of `master-data:sync` requires Google Sheets read access.

`schools:sync` always imports the shared Firebase/Data Connect organisations and their PT codes. Local Organisation records are not used for this shared master-data import, so they cannot prevent bookseller-to-school mappings from being created.

### Bookseller actual discounts

`actual_discount` is nullable source text in shared `booksellers` and local `vendors`; values such as `45% Gross` are preserved. The Vendors page displays this field read-only.

Preview, then apply the discount-only import after deploying the Data Connect schema/operations and applying Prisma migrations:

```bash
npx tsx scripts/import-bookseller-discounts.ts
npx tsx scripts/import-bookseller-discounts.ts --apply
```

The importer reads the linked Bookseller tab with Sheets read credentials and uses Firebase Admin credentials (Application Default Credentials or `FIREBASE_ADMIN_SERVICE_ACCOUNT_FILE`) for shared updates. An authenticated connector export, including headers, can be used with `--file tmp/bookseller-discounts.json`. It updates matching records in place, verifies shared writes before updating local vendors, and saves a backup under `tmp/bookseller-discount-backups/`. Duplicate code/subcode matches require verified source-row identity; unmatched records are reported and retained. A repeated import changes only differing values. If a shared update fails, local updates do not run; fix the failure and rerun to resume.

Duplicate source keys can also be resolved by matching both address and incumbent code when historical source-row numbers differ. Unmatched duplicate locations are reported, never assigned another location's discount.

Run matching checks with `node --import tsx --test lib/bookseller-discounts.test.ts`.

### Christian group master data

Christian C1 groups follow the same Firebase-first pattern as schools, vendors, and items. A trusted publisher environment reads the `Christian-Group Sheet` and writes its canonical copy to Firebase:

```bash
npm run christian-groups:publish
```

Configure `CHRISTIAN_GROUPS_SHEET_ID`, `CHRISTIAN_GROUPS_SHEET_RANGE`, and `GOOGLE_SHEETS_SERVICE_ACCOUNT_FILE` for a Google service account that has Viewer access to that sheet. Set `FIREBASE_ADMIN_SERVICE_ACCOUNT_FILE` as well when the publisher machine does not already have Firebase Application Default Credentials. Christian groups are read from local PostgreSQL and refreshed from Firebase through the **Sync Christian Groups** button.

### PT-code usage history

`npm run pt-usage:import` previews the usage pairs from the shared **Academic Year Implemented Schools** tab. Run `npm run pt-usage:import -- --apply` to import them into local PostgreSQL. It uses the existing Google Sheets read credentials and refuses non-local database hosts. An authenticated connector snapshot can be supplied with `--file path/to/rows.json` (a JSON array of rows including the header).

The `pt_code_usage_history` table stores one unique PT-code/session pair for each year with order usage, not the introduction year. Imports expand multiline PT-code cells, exclude aggregate `Group` labels (reporting their row numbers), validate all remaining rows before writing, preserve existing history, skip duplicate pairs, and verify the imported pairs inside the transaction.

Order creation, editing, and details show **Type of End User** for each selected end school. Classification combines imported history with saved orders except cancelled orders, resolving PR aliases to PT codes. Relative to the order's session, usage in the preceding session means **Old**; earlier usage without preceding-session usage means **Gap**; no earlier usage means **New**. Repeat orders in the same session keep the same type. Editing a session excludes that order's previous saved version from its preview. Missing sessions require a valid session, and history read failures display an unavailable state. Codes in imported history remain reserved and are preserved when the last local order is cancelled.

### GS master data and membership

The Grouped Schools page reads GS groups, addresses, and member PR/PT codes from PostgreSQL. Membership uses the trimmed, case-insensitive `Organisation.groupCode` relationship. Common school names are retained in metadata only.

Preview or apply a direct Google Sheets import:

```bash
npx tsx scripts/import-gs-groups.ts
npx tsx scripts/import-gs-groups.ts --apply
```

Configure `GROUP_SHEETS_ID`, `GROUP_SHEETS_RANGE`, and `GOOGLE_SHEETS_SERVICE_ACCOUNT_FILE` as needed. Application Default Credentials must have the Sheets read scope if no service-account file is supplied. The website's **Refresh GS from Google Sheet** action uses the same importer. A credential error preserves the current local dataset.

An authenticated connector export can also be imported as a JSON array of rows, including the header:

```bash
npx tsx scripts/import-gs-groups.ts --file tmp/group-sheet-import.json
npx tsx scripts/import-gs-groups.ts --file tmp/group-sheet-import.json --apply
npx tsx scripts/verify-group-logic.ts
```

Imports preserve record IDs, retire absent GS masters, and save pre-import JSON snapshots under `tmp/group-backups/` (excluded from Git). Raw source columns are stored in group metadata. The approved local `GSO198` correction is applied when `GS0198` exists; correcting the source organisation record separately prevents an organisation refresh from restoring that typo.

Order types are **Descriptive** (known end schools) and **Ambiguous** (end schools unknown). Descriptive Sheet 2 offers three direct choices: Individual, Multiple Schools, and Group. Individual selects exactly one school and its item quantities. Multiple Schools selects at least two distinct schools; Group selects one searchable GS or Christian group. Both Multiple Schools and Group record one shared total per item and finalize pooled quantities without multiplying by participant count. GS groups include every member organisation and allocate PT codes to PR-only members when saved; Christian groups use an editable school list. Saved GS participants remain snapshots. Older orders keep their stored modes and fulfillment sources; editing a legacy multi-school allocation sums quantities by item and asks for confirmation before saving the conversion to shared totals. Ambiguous orders accept only items and positive integer quantities. School selectors and school lists are hidden throughout this workflow. Previously saved school links are retained as hidden history when editing an order that remains ambiguous; explicit order-type changes retain the existing discard behavior.

Sheet 1 requires billing, shipping recipient/address, order type, and placed date. Billing and shipping each support school, vendor, group, or individual/manual entry and are independent of the chosen end schools and order type. Manual recipients need no master record or reference code. Session year, received/delivery dates, and other metadata are optional. Group selection never replaces billing or shipping. Reporting parents retain their tracking-container behavior and cannot be finalized.

The `202610200001_flexible_order_parties` migration converts combined orders to descriptive/group while retaining existing row IDs, quantities, snapshots, and fulfillment sources. The legacy database enum value and combined-sheet URLs remain for compatibility. Run `node --import tsx --test lib/contact-numbers.test.ts lib/validation/orders.test.ts` for validation checks. `scripts/verify-group-logic.ts` tests GS behavior inside a rolled-back transaction. `scripts/verify-order-flow.ts` exercises committed save/edit/lock/finalize transactions and is guarded to run only against the disposable local verification database on port 55439.

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
- `lib/validation/orders.ts` - Zod validation for Sheet 1, school-wise and pooled item quantities, and finalization fields.
- `components/orders/create-order-form.tsx` - step-based creation flow.
- `app/orders/[id]/page.tsx` - workflow-specific order details page.

## Authentication

The project includes a login-ready structure and a stub current user in `lib/auth.ts`. Replace this with NextAuth, custom sessions, or your preferred provider when real authentication is required.
