# Stripe Demo Account Setup Guide

## Step 1: Stripe Account Create Karein

### 1.1 Account Sign Up
1. [Stripe.com](https://stripe.com) par jayein
2. **"Start now"** ya **"Sign up"** button click karein
3. Email address, password, aur country select karein
4. Account create karein

### 1.2 Account Verification
1. Email verification karein
2. Basic business information fill karein:
   - Business name: "LWM Coaching" ya "Luke Westbrook-Manhattan Coaching"
   - Business type: "Individual" ya "Company"
   - Country: Apna country select karein

## Step 2: Test Mode (Demo) Activate Karein

### 2.1 Test Mode Check
1. Stripe Dashboard mein top right corner mein **"Test mode"** toggle check karein
2. Agar "Test mode" ON nahi hai, to toggle ON karein
3. Test mode ON hone par toggle green ho jayega

**Important:** Test mode mein real payments nahi hote, sirf testing ke liye

## Step 3: API Keys Lein

### 3.1 Secret Key (Backend ke liye)
1. Left sidebar mein **"Developers"** → **"API keys"** click karein
2. **"Secret key"** section mein **"Reveal test key"** button click karein
3. Key copy karein - yeh kuch aise dikhega:
   ```
   sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890...
   ```
4. **Important:** Ye key secret hai, kisi ko share na karein

### 3.2 Publishable Key (Frontend ke liye)
1. Same page par **"Publishable key"** section mein
2. Key copy karein - yeh kuch aise dikhega:
   ```
   pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890...
   ```

## Step 4: Webhook Secret (Optional - Production ke liye)

### 4.1 Webhook Endpoint Create Karein
1. **"Developers"** → **"Webhooks"** click karein
2. **"Add endpoint"** button click karein
3. Endpoint URL: `http://localhost:5000/api/payments/webhook` (development ke liye)
4. Events select karein:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
5. **"Add endpoint"** click karein
6. **"Reveal"** button se webhook secret copy karein

**Note:** Local development mein webhook testing ke liye Stripe CLI use karein (optional)

## Step 5: Backend .env File Mein Add Karein

`backend/.env` file mein yeh add/update karein:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Step 6: Frontend .env File Mein Add Karein

`frontend/.env` file mein yeh add/update karein:

```env
# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
```

## Step 7: Test Cards (Demo Payments ke liye)

Stripe Test Mode mein yeh test cards use karein:

### Successful Payment:
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

### Declined Payment (Testing ke liye):
```
Card Number: 4000 0000 0000 0002
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

### 3D Secure Authentication (Testing ke liye):
```
Card Number: 4000 0025 0000 3155
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

## Step 8: Verification

### 8.1 Backend Test
```bash
cd backend
npm run dev
```

Console mein check karein ki Stripe properly initialize ho raha hai.

### 8.2 Frontend Test
```bash
cd frontend
npm start
```

### 8.3 Payment Flow Test
1. Booking create karein
2. Payment button click karein
3. Stripe Checkout page open hoga
4. Test card details enter karein:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/25`
   - CVC: `123`
   - ZIP: `12345`
5. **"Pay"** button click karein
6. Success page par redirect hoga

## Step 9: Stripe Dashboard Mein Payments Check Karein

1. Stripe Dashboard → **"Payments"** section
2. Test mode ON hone par test payments dikhengi
3. Har payment ki details dekh sakte hain:
   - Amount
   - Status
   - Customer details
   - Payment method

## Important Notes:

### Test Mode vs Live Mode:
- **Test Mode:** Demo/testing ke liye, real money nahi charge hota
- **Live Mode:** Real payments ke liye, production mein use karein

### Security:
- Secret keys ko kabhi public nahi karein
- `.env` files ko `.gitignore` mein add karein
- Production mein environment variables directly set karein

### Webhooks (Local Development):
Local development mein webhooks test karne ke liye:
1. Stripe CLI install karein: `stripe listen --forward-to localhost:5000/api/payments/webhook`
2. Webhook secret automatically mil jayega

## Common Issues:

### Issue 1: "Invalid API Key"
**Solution:** Check karein ki test mode keys use kar rahe hain (sk_test_ aur pk_test_)

### Issue 2: Payment Not Processing
**Solution:** 
- Check karein ki backend server chal raha hai
- Network tab mein API calls check karein
- Backend console mein errors check karein

### Issue 3: Webhook Not Working
**Solution:**
- Local development mein Stripe CLI use karein
- Production mein webhook URL properly configure karein

## Next Steps:

1. ✅ Stripe account create karein
2. ✅ Test mode activate karein
3. ✅ API keys copy karein
4. ✅ .env files mein add karein
5. ✅ Backend aur frontend restart karein
6. ✅ Test payment karein

## Helpful Links:

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)

