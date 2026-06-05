# Deployment Guide — Sri Veda Gayatri Temple

## Step 1: Set Up Supabase (Database)

1. Go to https://supabase.com and create a free account
2. Create a new project (name: `veda-gayatri-temple`)
3. Go to **Settings → Database → Connection String → URI**
4. Copy the connection string — it looks like:
   `postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres`
5. Save this as your `DATABASE_URL`

## Step 2: Set Up Stripe

1. Go to https://dashboard.stripe.com
2. Copy your **Publishable key** and **Secret key** from Developers → API Keys
3. Set up a webhook:
   - Go to Developers → Webhooks → Add endpoint
   - URL: `https://srivedagayatritemple.org/api/stripe/webhook`
   - Events: `checkout.session.completed`
   - Copy the **Webhook signing secret**

## Step 3: Set Up Resend (Email)

1. Go to https://resend.com and create a free account
2. Add your domain `srivedagayatritemple.org` (verify DNS)
3. Create an API key and save it

## Step 4: Deploy to Vercel

1. Push code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Sri Veda Gayatri Temple website"
   git remote add origin https://github.com/YOUR_USERNAME/sri-veda-gayatri-temple.git
   git push -u origin main
   ```

2. Go to https://vercel.com → New Project → Import from GitHub

3. Add all environment variables (from `.env.example`):
   - `DATABASE_URL`
   - `NEXTAUTH_URL` = `https://srivedagayatritemple.org`
   - `NEXTAUTH_SECRET` (generate: `openssl rand -base64 32`)
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `RESEND_API_KEY`
   - `NEXT_PUBLIC_APP_URL` = `https://srivedagayatritemple.org`

4. Click **Deploy**

## Step 5: Run Database Migration

After first deploy, run in Vercel's terminal or locally with production DATABASE_URL:
```bash
DATABASE_URL="your-supabase-url" npx prisma migrate deploy
DATABASE_URL="your-supabase-url" npx prisma db seed
```

## Step 6: Connect Your Domain

1. In Vercel → Project → Settings → Domains
2. Add `srivedagayatritemple.org`
3. At your domain registrar, update DNS:
   - **A record**: `@` → `76.76.21.21` (Vercel IP)
   - **CNAME**: `www` → `cname.vercel-dns.com`
4. SSL is auto-provisioned by Vercel

## Default Admin Login (after seed)

- Email: `vgcc@srivedagayatritemple.org`
- Password: `admin123!`
- **Change this immediately after first login**

## Local Development

```bash
cp .env.example .env
# Fill in your values in .env
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

Visit http://localhost:3000
