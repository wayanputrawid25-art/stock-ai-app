# Frequency Analyzer 4D Pro

Private premium SaaS app for 4D historical result analysis. Public registration is intentionally absent. Users contact the Telegram admin, payment is verified manually, and an administrator creates the account.

## Stack

- Next.js 15, TypeScript, Tailwind CSS, shadcn-style components
- Next.js Server Actions and API Routes
- Prisma with Neon PostgreSQL
- Custom credentials authentication with signed HTTP-only cookies
- Tesseract.js OCR
- Recharts dashboards
- CSV and Excel exports

## Local Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set `DATABASE_URL`, `JWT_SECRET`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL`.

3. Apply migrations and seed the first admin:

```bash
npm run prisma:migrate
npm run seed
```

4. Start the app:

```bash
npm run dev
```

Seed login:

- Email: `admin@example.com`
- Password: `Admin@12345`

Change this password immediately in production.

## Deployment Guide

1. Create a Neon PostgreSQL database.
2. Add Vercel environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - optional `NEXT_PUBLIC_TELEGRAM_URL`
3. Deploy to Vercel.
4. Run `npx prisma migrate deploy` in the Vercel build or deployment command.
5. Seed an admin account once from a trusted environment, then rotate the default password.

## Security Notes

- No public registration route exists.
- Passwords are hashed with bcrypt.
- Sessions are signed, HTTP-only, same-site cookies.
- Protected routes are guarded by middleware and server checks.
- User login checks active status and membership expiry.
- Input and file uploads are validated.
- Prisma parameterization protects database queries.
- OCR route includes file type, size, and rate-limit checks.

## Implemented Modules

- Landing, features, pricing, contact, login
- Admin dashboard, user management, activity logs
- User dashboard, result input, OCR scanner, analysis history
- Frequency, hot, cold, gap, trend, odd-even, big-small, prediction scoring
- CSV and Excel export routes
