# SmartBus - multi-institute transport management

## Run locally

Use Node.js 24 or newer. In separate terminals:

~~~powershell
cd "D:\Bus Track\Bus-Backend"
npm install
npm start
~~~

~~~powershell
cd "D:\Bus Track\Bus-Frontend"
npm install
npm run dev
~~~

Open http://localhost:5173. The API runs on http://localhost:5001.
For another API host, set VITE_API_URL in the frontend environment (restart Vite).
The backend uses PostgreSQL. Copy `Bus-Backend/.env.example` to `Bus-Backend/.env` and set the PostgreSQL credentials before starting it. Backend settings include PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, DB_SSL, DB_POOL_MAX, PORT, CLIENT_ORIGIN and optional JWT_SECRET.

To import the existing SQLite data once into an empty PostgreSQL database:

~~~powershell
cd "D:\Bus Track\Bus-Backend"
npm run db:migrate
npm run db:check
~~~

The original `database.sqlite` remains unchanged as a migration source/backup. The running API reads and writes PostgreSQL.

The live map uses Google Maps. Put the browser-restricted key in `Bus-Frontend/.env.local`:

~~~env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_MAP_PROVIDER=google
~~~

Enable **Maps JavaScript API** in Google Cloud. Restrict the key to your production domain and local development referrers. Bus coordinates still come from the driver's device GPS; Google Maps displays those live coordinates and map data.

Google Maps requires an active billing account. For local testing without Google billing, set `VITE_MAP_PROVIDER=osm`; the same live driver GPS coordinates will be displayed using OpenStreetMap/CARTO instead.

## Existing local account

- Super admin: admin@smartbus.com / password123
- Student: student@smartbus.com / password123 (subject to its access status)

The one-time migration promotes existing unscoped admins to superadmins and assigns existing students, drivers, buses and routes to **Main Campus**. Existing records and passwords are preserved. Existing students keep their access until an administrator sets a duration. A backup of this workspace's pre-migration database is in Bus-Backend/backups/.

Sign in again after the upgrade: sessions now validate against the current account and a persisted server secret.

## Institute setup

1. Sign in as superadmin, then open **Institutes & admins**.
2. Create or rename institutes and create an administrator assigned to each institute. Administrators can also be edited, have their password reset, or be removed here.
3. Select an institute above the dashboard, fleet, drivers or routes pages before creating records. Superadmin can view all institutes; institute admins only access their own data.
4. Create routes, driver accounts and buses, then assign drivers to buses. Drivers and routes must belong to the bus's institute.

HTTP endpoints and live Socket.IO updates both enforce institute access. Students and drivers only see their own institute's transport data.

## Manual payments and student duration

In **Student management**, add a student or review a student's self-registration. New students are suspended pending activation.

- **Payment & duration**: enter amount received, currency, receipt/reference, and start/end dates. Choose 30, 90, 365 days or custom dates. Saving records the payment and replaces the student's current access period.
- **Manage access**: activate with dates or suspend manually without recording a payment.
- Dates use UTC. The end date is inclusive through 23:59:59 UTC; access is blocked starting the next day. Future periods allow access only from their start date.
- Expiry is checked on every protected request and login. A 30-second maintenance job updates persisted status and disconnects expired live sessions. Manual suspension disconnects live sessions immediately.
- Login displays the appropriate pending, admin-suspended, future-start or expired message. Student accounts are created by institute administrators; public signup is disabled.
- Historical payments remain after deleting a student, with the student shown as deleted.

Use institute, status and name/email filters, then **Clear filters** to reset them. Student PDF export follows the selected filters.

## PDF reports

Download PDFs directly from each management page: fleet, drivers (matching search), students (matching filters), routes, and the institute/administrator lists. Student management also includes a Payments PDF button for the selected institute. Overview provides Download all data. Institute admins can only export their own institute's data. Reports include repeated table headers, page numbers and generation time. Passwords and tokens are never exported.

## Layout and themes

Dark/light mode is saved locally and available at the top. Both modes use the same information and typography. Student and driver layouts use responsive cards, vertical stop timelines, maps that resize with the layout, and map controls outside the map canvas. Driver simulation is labelled separately from GPS sharing.

## Verification

~~~powershell
cd "D:\Bus Track\Bus-Backend"
npm test
cd "D:\Bus Track\Bus-Frontend"
npm run build
~~~

Integration tests use temporary PostgreSQL schemas and never modify the public application schema. They cover institute permissions, driver ownership, pending admin-created accounts, manual payment validation, expiry, suspension, socket isolation, PDF generation/pagination and repeatable schema initialization. Install frontend dependencies before backend tests because the socket test uses its Socket.IO client.

## Account activation and institute administrators

Each institute can have one administrator. Use **Change admin** on its institute card to replace that person; the prior login and sessions are revoked. Existing payments remain associated with the same institute.

New student, driver and admin accounts receive the temporary password `password123` automatically. On first sign-in, the account holder must set a different password (at least 8 characters), then sign in again. Dashboard access is blocked until this step is complete. Pending or suspended students still require activation. Password changes by an administrator also require the account holder to change that password at the next sign-in.

The migration preserves existing passwords and requires existing accounts, including superadmin, to change them at the next sign-in. Password fields have show/hide controls.
