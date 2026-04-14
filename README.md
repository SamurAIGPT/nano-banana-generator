# 🚀 Modular SaaS Template Engine

This is a **high-performance, modular SaaS starter kit** designed for single-click Vercel deployments. It decouples core business logic (Auth, Payments, Credits) from the UI, allowing you to build and ship multiple templates rapidly.

## 🛠️ Modular Architecture

The template is organized into a **Service Layer** architecture to ensure re-usability:

- **`src/lib/config.js`**: Single source of truth for all environment variables.
- **`src/lib/services/`**: Concentrated business logic.
  - `user.js`: Manages user profiles and credit balances.
  - `billing.js`: Handles Stripe Checkout and Webhook fulfillment.
  - `ai.js`: Manages AI model logic (Nano Banana). Swap this out for OpenAI/Replicate in seconds.
- **`src/components/saas/`**: Reusable UI components like `LoginButton`, `SignOutButton`, and `CreditBadge`.

## 🚀 One-Click Deployment

Deploy your own instance directly to Vercel. Provide your keys during the deployment process.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_GITHUB_USER/nano-banana-template&env=GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,STRIPE_SECRET_KEY,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,STRIPE_WEBHOOK_SECRET,NANO_BANANA_API_KEY,NEXTAUTH_SECRET,DATABASE_URL,DIRECT_URL)

> **Pro Tip:** Fork this repo, replace `YOUR_GITHUB_USER` in the link above, and you have your own white-label SaaS deployment button.

## 🔑 Required Environment Variables

| Service | Variables |
|---------|-----------|
| **Google Auth** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| **Stripe** | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` |
| **Database** | `DATABASE_URL` (Postgres) |
| **AI (Banana)** | `NANO_BANANA_API_KEY` |
| **NextAuth** | `NEXTAUTH_SECRET`, `NEXTAUTH_URL` |

## 💻 Local Development

1. **Setup Env**: Copy `.env.example` to `.env` and add your keys.
2. **Install**: `npm install`
3. **Database**: `npx prisma generate` followed by `npx prisma db push`.
4. **Run**: `npm run dev`

Open [http://localhost:3000](http://localhost:3000).

## 🧩 Building New Templates

To build a new template:
1. Keep the `src/lib/services` and `src/app/api` folders.
2. Update the UI in `src/app/page.js` using the reusable components in `src/components/saas`.
3. If you want to change the AI provider, simply update `src/lib/services/ai.js`.
