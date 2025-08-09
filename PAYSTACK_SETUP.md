# Paystack Payment Integration Setup

This document explains how to set up Paystack payment integration for ContractObligation.

## Prerequisites

1. A Paystack account (sign up at https://paystack.com)
2. Paystack API keys (test and live)

## Setup Instructions

### 1. Get Paystack API Keys

1. Log in to your Paystack Dashboard
2. Go to Settings > API Keys & Webhooks
3. Copy your **Public Key** and **Secret Key**
4. For testing, use the test keys (they start with `pk_test_` and `sk_test_`)

### 2. Update Environment Variables

Update your `.env.local` file with your Paystack keys:

```env
# Paystack Configuration
PAYSTACK_PUBLIC_KEY=pk_test_your_actual_public_key_here
PAYSTACK_SECRET_KEY=sk_test_your_actual_secret_key_here
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_actual_public_key_here
```

**Important:** 
- Replace `pk_test_your_actual_public_key_here` with your actual Paystack public key
- Replace `sk_test_your_actual_secret_key_here` with your actual Paystack secret key
- The `NEXT_PUBLIC_` prefix makes the public key available to the frontend

### 3. Test Payment Flow

1. Start the development server: `npm run dev`
2. Upload a PDF contract
3. Click "Pay $5 to See Full Results"
4. Enter a test email address
5. Use Paystack test card details:
   - **Card Number:** 4084084084084081
   - **Expiry:** Any future date (e.g., 12/25)
   - **CVV:** Any 3 digits (e.g., 123)

### 4. Production Setup

For production deployment:

1. Replace test keys with live keys in your production environment
2. Currency is set to ZAR (South African Rand) - R90 equivalent to $5 USD
3. Set up webhooks for payment notifications (optional but recommended)

## Payment Flow

1. **Upload & Process:** User uploads PDF, AI extracts obligations
2. **Preview:** Show first 3 obligations as preview
3. **Payment:** User enters email and pays $5 (R90 ZAR) via Paystack
4. **Verification:** Payment is verified with Paystack API
5. **Results:** User gets full results with download options

## Currency Configuration

- **UI Display:** Shows $5 to users
- **Backend Processing:** Converts to R90 ZAR (1 USD = 18 ZAR)
- **Paystack Currency:** ZAR (South African Rand)
- **Amount:** R90.00 (9000 cents in Paystack)

## API Endpoints

- `POST /api/paystack/initialize` - Initialize payment
- `GET /api/paystack/verify` - Verify payment status
- `POST /api/store-results` - Store results temporarily
- `GET /api/results` - Get results after payment

## Security Notes

- Secret keys are only used on the server side
- Payment verification is done server-side
- Results are stored temporarily and cleaned up automatically
- All sensitive operations require payment verification

## Troubleshooting

### Common Issues

1. **"Paystack secret key not configured"**
   - Check that `PAYSTACK_SECRET_KEY` is set in `.env.local`
   - Restart the development server after updating environment variables

2. **Payment popup doesn't appear**
   - Check that `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` is set correctly
   - Check browser console for JavaScript errors

3. **Payment verification fails**
   - Ensure you're using the correct API keys
   - Check that the payment reference matches

### Testing Cards

Use these test card numbers for different scenarios:

- **Successful payment:** 4084084084084081
- **Insufficient funds:** 4084084084084081 (with amount > 300000)
- **Invalid card:** 4084084084084082

## Support

For Paystack-specific issues, check:
- [Paystack Documentation](https://paystack.com/docs)
- [Paystack Test Cards](https://paystack.com/docs/payments/test-payments)
- [Paystack API Reference](https://paystack.com/docs/api)