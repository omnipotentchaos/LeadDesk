# LeadDesk Mini

LeadDesk Mini is a small lead-capture product. Visitors submit an enquiry on the public landing page, and an admin signs in to search leads and update their status.

## Stack

- **Next.js** — pages and user interface
- **Supabase Postgres** — database
- **Supabase Auth** — email/password admin login

## Data model

There are two database tables.

| Table | What it stores | Why it exists |
| --- | --- | --- |
| `leads` | A visitor's name, email, budget, message, status, and submission date | This is the main lead pipeline. |
| `admin_users` | The ID of each Supabase user who is allowed to use the admin area | This separates normal authenticated users from actual admins. |

Each lead starts with the status **New**. The admin can change it to **Contacted** or **Closed**. The database also checks that required fields are present, the email has a valid format, the budget is one of the allowed rupee ranges, and the status is valid.

### Simple way to explain the data model

> A lead is one row in the `leads` table. It contains everything submitted through the form plus a status so the team can track progress. I use a separate `admin_users` table to explicitly decide who can manage those leads.

## Authentication and access control

Supabase Auth handles the real email/password login. Passwords are managed by Supabase, not saved in this project or stored in the `leads` table.

After a successful login, Supabase creates and keeps the user's session. The admin page checks whether the logged-in user's ID appears in `admin_users`:

- If it does, the user can view leads and change their status.
- If it does not, the user sees an “not an admin account” message.

The Supabase publishable key is safe to use in the browser. It does not bypass database security. **Row Level Security (RLS)** rules in [`supabase/schema.sql`](./supabase/schema.sql) enforce the permissions in the database itself:

- Anyone can submit a new lead from the public form.
- Only a logged-in user listed in `admin_users` can read or update leads.

### Simple way to explain the auth approach

> Supabase handles login and sessions. My app then checks whether that signed-in user is in the `admin_users` table. RLS repeats that check in the database, so someone cannot bypass the UI and read leads directly through the API.

## Set up Supabase

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql).
3. In **Authentication → Users**, create an email/password user for the admin.
4. Copy that user's UUID and run the final `insert` command shown in `schema.sql`. This marks that user as an admin.
5. Copy `.env.example` to `.env` and add the Supabase project URL and publishable key.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The admin area is at `http://localhost:3000/admin`.

### Admin test credentials

```text
Email: admin@lead.com
Password: 123456
```

## Walkthrough flow

1. Submit a lead from the landing page.
2. Open `/admin` in a fresh private browser window.
3. Sign in with the Supabase admin account.
4. Search for the new lead and change its status.
