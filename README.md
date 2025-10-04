# AI Blueprint for Education

A production-grade SaaS platform for higher education institutions to assess their AI readiness and develop implementation strategies.

## Overview

AI Blueprint for Education helps colleges and universities navigate their AI transformation journey through:
- Comprehensive AI readiness assessments
- Personalized implementation roadmaps  
- Faculty adoption tools and training
- Peer institution benchmarking
- ROI calculators and budget planning

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe Subscriptions
- **Email**: Postmark
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account and project
- Stripe account (test mode for development)
- Postmark account for emails

### Environment Setup

1. Clone the repository
2. Copy `.env.local.example` to `.env.local`
3. Fill in your environment variables:

```bash
# Required Supabase vars
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Stripe (get from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_EDU_MONTHLY_199=price_...  # Your monthly price ID
STRIPE_PRICE_EDU_YEARLY_1990=price_...  # Your yearly price ID

# Email (Postmark)
POSTMARK_SERVER_TOKEN=your-token
POSTMARK_FROM_EMAIL=noreply@yourdomain.com
```

### Installation

```bash
# Install dependencies
pnpm install

# Run database migrations (if using Prisma)
pnpm prisma migrate dev

# Start development server
pnpm dev
```

Visit http://localhost:3000 to see the application.

## Project Structure

```
app/
├── (auth)/           # Authentication pages
├── api/              # API routes
├── assessment/       # AI readiness assessment
├── dashboard/        # User dashboard
├── onboarding/       # New user onboarding
├── pricing/          # Subscription pricing
└── page.tsx          # Homepage

lib/
├── ai-blueprint-edu-product.ts  # Product configuration
├── env.ts                       # Environment validation
├── supabase.ts                 # Supabase client
└── supabase-admin.ts           # Admin client

components/
└── ui/               # Shared UI components
```

## Key Features

### Subscription Management
- Single product: $199/month or $1,990/year
- 7-day free trial
- Automatic subscription management via Stripe

### Educator-Focused Onboarding
- Role-based setup (Faculty, Admin, Department Head, IT Staff)
- Institution profiling
- Goal and challenge identification
- Team collaboration tools

### AI Readiness Assessment
- Streamlined assessment process
- Automated scoring and gap analysis
- Personalized recommendations
- Progress tracking

### Dashboard
- Real-time progress monitoring
- Benchmark comparisons
- Document management
- Implementation roadmaps

## Deployment

### Vercel Deployment

1. Push to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Production Checklist

- [ ] Set production Stripe keys
- [ ] Configure Supabase RLS policies
- [ ] Set up Stripe webhook endpoint
- [ ] Configure custom domain
- [ ] Enable email verification
- [ ] Set up monitoring/analytics

## Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build           # Build for production
pnpm start           # Start production server

# Testing
pnpm test            # Run tests
pnpm typecheck       # Type checking
pnpm lint            # Linting

# Utilities
pnpm verify-env      # Verify environment setup
pnpm verify-stripe   # Verify Stripe prices
```

## Support

For technical support or questions, contact support@aiblueprint.edu

## License

© 2025 AI Blueprint for Education. All rights reserved.