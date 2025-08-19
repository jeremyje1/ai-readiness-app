# NorthPath Strategies Organizational Realignment App

![Algorithm v2.1](https://img.shields.io/badge/Algorithm-v2.1-blueviolet)
![UI Components](https://img.shields.io/badge/UI-Enhanced-success)
![Security](https://img.shields.io/badge/Security-Protected-red)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Environment Setup

Before running the application, you need to set up your environment variables:

1. Copy `.env.example` to `.env.local`
2. Fill in the required environment variables (see Environment Variables section below)

### Secure Setup (Recommended)

To set up the development environment with recommended security measures:

```bash
# From the project root directory
./scripts/secure-setup.sh
```

This script will:
- Create a secure `.env.local` file from the template
- Install dependencies
- Set up git hooks for security checks
- Configure git-crypt if available
- Run security audits
- Display important security reminders

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Variables

This project requires the following environment variables:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Database Connection (for Prisma)
DATABASE_URL=your_database_url

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Stripe Integration (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_SECRET_KEY=your_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Price IDs
STRIPE_SINGLE_USE_PRICE_ID=price_id_here
STRIPE_MONTHLY_SUBSCRIPTION_PRICE_ID=price_id_here
STRIPE_COMPREHENSIVE_PRICE_ID=price_id_here
STRIPE_ENTERPRISE_PRICE_ID=price_id_here
```

Never commit actual values to the repository. For production, set these in the Vercel environment settings.

## Security

This project implements several security measures:

- Pre-commit hooks to prevent committing sensitive information
- Environment variable segregation for development/production
- Secure API key handling

See [Security Best Practices](./docs/SECURITY_BEST_PRACTICES.md) for more information.

## UI Components

The application features several enhanced UI components:

- **EnhancedHero**: Modern hero section with background image and animations
- **ContentSections**: Three-column grid layout with scroll-based animations
- **TestimonialsCarousel**: Auto-scrolling carousel with user controls and transitions
- **EnhancedFooter**: Modern footer with newsletter signup functionality

See the `/docs` directory for detailed documentation on each component.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Algorithm v2.1

- Segment-based weights for Higher Ed, Non-Profit, Healthcare, Government, and For-Profit
- Confidence interval and peer percentile shown in results
- Full explainability table for transparency
- All tests pass in CI (see /__tests__/lib/algorithm/score.test.ts)

See `lib/algorithm/score.ts` and `docs/algorithm_validation_and_v2.1.md` for details.
