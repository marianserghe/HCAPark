# HCA Park - Neighborhood Dues Collection App

A public accountability map for collecting neighborhood park maintenance dues. Each household appears on a map as green (paid) or red (unpaid), creating social pressure to contribute.

## Features

- 🗺️ **Interactive Map** - See all 381 households with color-coded payment status
- 💰 **Payment Tracking** - Track who has paid their $50 annual dues
- 📊 **Live Stats** - Percentage paid, total collected, outstanding amount
- 👨‍💼 **Admin Dashboard** - Mark payments, search by address/name, filter by status
- 🔐 **Public Access** - No login required to view map, encourages transparency

## Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Run the SQL migration in `supabase/migration.sql` via SQL Editor
3. Copy your project URL and anon key

### 2. Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Import Household Data

1. Copy your household data to `scripts/households-data.json`
2. Run the import script:

```bash
npx ts-node scripts/import-households.ts
```

### 5. Geocode Addresses (Optional)

To show pins on the map, addresses need lat/lng coordinates:

1. Get a HERE API key from [developer.here.com](https://developer.here.com)
2. Add `EXPO_PUBLIC_HERE_API_KEY` to `.env.local`
3. Run the geocoding function in the import script

### 6. Run the App

```bash
npm start
# Press 'i' for iOS, 'a' for Android, 'w' for web
```

## Project Structure

```
├── app/
│   ├── _layout.tsx          # Navigation layout
│   ├── index.tsx            # Map screen (main)
│   ├── admin.tsx            # Admin dashboard
│   └── household/[id].tsx   # Household detail/payment
├── components/
│   └── ...                   # Reusable components
├── constants/
│   └── index.ts             # Colors, config, fees
├── lib/
│   └── supabase.ts          # Supabase client & types
├── scripts/
│   ├── import-households.ts # Data import script
│   └── households-data.json # Raw household data
└── supabase/
    └── migration.sql        # Database schema
```

## Payment Integration (Coming Soon)

The app is configured for Stripe integration:

- Payment fee passed to payer: **$1.80** (2.9% + $0.30)
- Total charge: **$51.80** for $50 dues
- Neighborhood receives exactly $50 per payment

To enable Stripe:
1. Create a Stripe account
2. Add `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `.env.local`
3. Implement Stripe Checkout in `app/household/[id].tsx`

## Data Source

Households imported from `HCA_2024_DUES_BUDGET.xlsx` containing 381 households across 26 streets in Waldwick, NJ 07463.

## Privacy Considerations

- Map shows payment status publicly
- Names and addresses are visible to all users
- Consider anonymizing if you want private status tracking

## License

MIT