# Create backend .env file
@"
# Backend Environment Variables

# Developer Mode (set to true for development)
IS_DEVELOPER=true

# Database
MONGODB_URI=mongodb://localhost:27017/life-coach

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Server
PORT=5000
NODE_ENV=development
"@ | Out-File -FilePath "backend\.env" -Encoding UTF8

# Create frontend .env file
@"
# Frontend Environment Variables

# Developer Mode (set to true for development)
REACT_APP_IS_DEVELOPER=true

# API Configuration
REACT_APP_API_URL=http://localhost:5000

# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# App Configuration
REACT_APP_NAME=Life Coach
REACT_APP_VERSION=1.0.0
"@ | Out-File -FilePath "frontend\.env" -Encoding UTF8

Write-Host "Environment files created successfully!" -ForegroundColor Green
Write-Host "Developer mode is ENABLED" -ForegroundColor Yellow
Write-Host "You can now run the servers without MongoDB or authentication" -ForegroundColor Cyan
