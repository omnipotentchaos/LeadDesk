# LeadDesk Mini — Next.js + Supabase

A small lead-capture product with a public form and a protected admin page.

## Stack

- Next.js for the pages and UI
- Supabase Auth for email/password admin login
- Supabase Postgres for leads

## Set up Supabase

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql).
3. In **Authentication → Users**, create an email/password user for the admin.
4. Copy that user’s UUID and run the last `insert` command shown in `schema.sql`. This marks that one user as an admin.
5. Copy `.env.local.example` to `.env.local` and add the project URL and publishable key from Supabase.

The browser only receives the publishable key. The database is protected by the Row Level Security policies in `schema.sql`: anyone can submit a form, but only a user listed in `admin_users` can read or change leads.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The admin area is at `http://localhost:3000/admin`.

## Deploy

Push this repository to GitHub, import it into Vercel, and add the same two environment variables from `.env.local` in Vercel’s project settings. Supabase hosts the database and auth, so there is no local database file or persistent disk to configure.

For the walkthrough, submit an enquiry, open `/admin` in a fresh private window, sign in using the Supabase admin user, and change that enquiry’s status.
