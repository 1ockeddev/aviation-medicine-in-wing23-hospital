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
   - Copy `.env` and update with your database credentials
   - Update `DATABASE_URL` with your PostgreSQL connection string
   - Set `NEXTAUTH_SECRET` to a random string

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

## License

Private - For internal hospital use only
# aviation-medicine-in-wing23-hospital
