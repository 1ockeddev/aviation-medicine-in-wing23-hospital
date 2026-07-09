# Hospital Medication Database System

ระบบฐานข้อมูลยาสำหรับโรงพยาบาล - A web-based CRUD application for managing hospital medication records.

## Technology Stack

- **Frontend & Backend**: Next.js 14+ (App Router)
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 5+
- **Authentication**: NextAuth.js v5
- **UI Framework**: React 18+ with Tailwind CSS 3+
- **Validation**: Zod
- **Password Hashing**: bcryptjs

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Update `DATABASE_URL` with your PostgreSQL connection string
   - Set `NEXTAUTH_SECRET` to a random string (generate with `openssl rand -base64 32`)
   - Configure LINE Platform credentials (see [LINE Platform Setup](#line-platform-setup) section below)

3. Set up the database:
```bash
npx prisma migrate dev --name init
```

4. (Optional) Seed the database:
```bash
npx prisma db seed
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

```
medication-db/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   └── login/                # Login page
│   ├── (dashboard)/              # Protected route group
│   │   ├── medications/          # Medication management
│   │   └── categories/           # Category management
│   ├── api/
│   │   └── auth/[...nextauth]/   # NextAuth API routes
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # Reusable UI components
│   ├── forms/                    # Form components
│   ├── layout/                   # Layout components
│   └── providers/                # Client-side providers
├── lib/
│   ├── prisma.ts                 # Prisma client singleton
│   ├── auth.ts                   # NextAuth configuration
│   ├── validations.ts            # Zod schemas
│   └── utils.ts                  # Utility functions
├── actions/                      # Server Actions
│   ├── medications.ts            # Medication CRUD
│   ├── categories.ts             # Category CRUD
│   └── auth.ts                   # Auth actions
├── types/
│   └── index.ts                  # TypeScript types
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # Migration files
│   └── seed.ts                   # Seed data
└── middleware.ts                 # Next.js middleware for auth
```

## Database Schema

- **User**: Admin users with authentication credentials
- **Category**: Two-level hierarchical categories (Category and Sub-Category)
- **Medication**: Medication records with detailed information

## Features

- 🔐 Secure authentication for administrators
- 📊 Hierarchical category management (2 levels)
- 💊 Complete medication CRUD operations
- 🔍 Search functionality by name and trade name
- 📄 Pagination support
- 🌐 Thai language interface
- ⚡ Fast loading with Next.js Server Components
- 📲 LINE Mini App integration for medication expiration notifications

## LINE Platform Setup

This application integrates with LINE Platform to provide medication expiration notifications via LINE Messaging API and user registration through LINE Mini App (LIFF).

### Prerequisites

1. A LINE Business Account
2. A LINE Developers account

### Setup Steps

1. **Create a LINE Channel**
   - Go to [LINE Developers Console](https://developers.line.biz/)
   - Create a new Provider (if you don't have one)
   - Create a new Messaging API channel

2. **Configure Messaging API**
   - In your channel's "Messaging API" tab:
     - Issue a Channel Access Token (long-lived or permanent)
     - Copy the Channel Access Token and add it to `.env.local` as `LINE_CHANNEL_ACCESS_TOKEN`
   - In "Basic settings" tab:
     - Copy the Channel ID and add it to `.env.local` as `LINE_CHANNEL_ID`
     - Copy the Channel Secret and add it to `.env.local` as `LINE_CHANNEL_SECRET`

3. **Create a LIFF App**
   - In your channel's "LIFF" tab, click "Add"
   - Configure the LIFF app:
     - **LIFF app name**: Medication Wing23 Registration (or your preferred name)
     - **Size**: Full
     - **Endpoint URL**: `https://yourdomain.com/line/register` (for production) or `http://localhost:3000/line/register` (for development)
     - **Scope**: `profile` (required to get user information)
   - Copy the LIFF ID and add it to `.env.local` as `LIFF_ID`

4. **Configure Additional Environment Variables**
   - Set `CRON_SECRET` to a random string (generate with `openssl rand -base64 32`)
     - This is used to authenticate scheduled job endpoints
   - Set `NEXT_PUBLIC_APP_URL` to your application's public URL
     - For development: `http://localhost:3000`
     - For production: `https://yourdomain.com`

5. **Set Up Scheduled Jobs** (Production Only)
   - If deploying to Vercel:
     - The `vercel.json` file already configures the cron job
     - Vercel will automatically call `/api/cron/check-expiry` daily at 9:00 AM
   - If using another platform:
     - Set up a cron job or scheduled task to call `https://yourdomain.com/api/cron/check-expiry`
     - Include the Authorization header: `Bearer <your-CRON_SECRET>`
     - Schedule: Daily at 9:00 AM (or your preferred time)

### Environment Variables Reference

All LINE Platform environment variables are documented in `.env.example` with detailed explanations:

- `LINE_CHANNEL_ID` - Your LINE Channel ID from Basic settings
- `LINE_CHANNEL_SECRET` - Your LINE Channel Secret from Basic settings
- `LINE_CHANNEL_ACCESS_TOKEN` - Long-lived access token from Messaging API
- `LIFF_ID` - LIFF App ID from LIFF settings
- `CRON_SECRET` - Secret token for authenticating cron job endpoints
- `NEXT_PUBLIC_APP_URL` - Public URL of your application

### Testing LINE Integration

1. **Register a Test User**
   - Open your LIFF app URL in LINE app
   - Complete the registration process
   - Check the admin panel at `/admin/line-users` to verify registration

2. **Send a Test Notification**
   - Log in to the admin panel
   - Navigate to `/admin/line-users`
   - Click "Send Test Notification" for your registered user
   - Check your LINE app for the notification

3. **Test Scheduled Notifications**
   - Manually trigger the cron endpoint (include the CRON_SECRET in Authorization header):
   ```bash
   curl -X GET http://localhost:3000/api/cron/check-expiry \
     -H "Authorization: Bearer your-CRON_SECRET"
   ```
   - Verify notifications are sent to users with expiring medications

## License

Private - For internal hospital use only
# aviation-medicine-in-wing23-hospital
