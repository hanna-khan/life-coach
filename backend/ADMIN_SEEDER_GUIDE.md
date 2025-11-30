# Admin User Seeder Guide

## 🔐 Secure Admin User Creation

This guide explains how to securely create an admin user for the application.

## ⚠️ Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use strong passwords** (min 12 characters, mix of uppercase, lowercase, numbers, symbols)
3. **Change default password** after first login
4. **Use environment variables** instead of hardcoded credentials

## 📝 Setup Instructions

### Step 1: Configure Admin Credentials

Add these variables to `backend/.env` file:

```env
# Admin User Credentials (for seeder)
ADMIN_EMAIL=admin@lifecoach.com
ADMIN_PASSWORD=YourStrongPassword123!
ADMIN_NAME=Admin User
```

**Important**: 
- Change `ADMIN_PASSWORD` to a strong, unique password
- Use a secure email address
- Never share these credentials

### Step 2: Run the Seeder

```bash
cd backend
npm run create-admin
```

### Step 3: Verify Admin User

After running the seeder, you can:
1. Login at `/login` with the credentials you set
2. Access admin panel at `/admin`

## 🔒 Security Recommendations

### For Development:
- Use a simple password for testing (but still secure)
- Document credentials in a secure password manager
- Never commit `.env` to git

### For Production:
- Use a **very strong password** (20+ characters recommended)
- Use a **unique email** (not admin@lifecoach.com)
- Enable **2FA** if possible (future feature)
- **Rotate passwords** regularly
- **Limit admin access** to trusted users only

## 🛠️ Troubleshooting

### Admin Already Exists
If you see "Admin user already exists", you can:
1. Change `ADMIN_EMAIL` in `.env` to create a different admin
2. Or delete the existing admin from database manually

### Password Requirements
- Minimum 6 characters (as per User model)
- Recommended: 12+ characters with mix of:
  - Uppercase letters (A-Z)
  - Lowercase letters (a-z)
  - Numbers (0-9)
  - Special characters (!@#$%^&*)

## 📋 Example Strong Passwords

✅ **Good Examples:**
- `MySecure@Pass2024!`
- `Admin#LifeCoach$2024`
- `L1f3C0@ch!Admin2024`

❌ **Bad Examples:**
- `admin123` (too simple)
- `password` (common password)
- `12345678` (only numbers)

## 🔄 Changing Admin Password

After first login:
1. Go to Admin Panel
2. Navigate to Profile Settings (if available)
3. Change password to a new secure one
4. Update `ADMIN_PASSWORD` in `.env` for future reference

## 📞 Support

If you encounter issues:
1. Check MongoDB connection
2. Verify `.env` file has correct values
3. Ensure User model is properly configured
4. Check console logs for error messages

