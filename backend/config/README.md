# Google Service Account Configuration

## 📋 Setup Instructions

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Note your project ID

### Step 2: Enable APIs
1. Go to "APIs & Services" → "Library"
2. Enable **Google Calendar API**
3. Enable **Google Meet API** (usually included with Calendar API)

### Step 3: Create Service Account
1. Go to "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
3. Name: `life-coach-calendar`
4. Description: "Service account for generating Google Meet links"
5. Click "Create and Continue"
6. Role: "Editor" (or "Calendar Admin" for more permissions)
7. Click "Done"

### Step 4: Create Key
1. Click on the service account you just created
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Select "JSON"
5. Download the JSON file
6. **Rename it to:** `google-service-account.json`
7. **Move it to:** `backend/config/google-service-account.json`

### Step 5: Share Calendar
1. Open [Google Calendar](https://calendar.google.com)
2. Go to Settings → "Settings for my calendars"
3. Select your calendar (or create a new one)
4. Go to "Share with specific people"
5. Click "Add people"
6. Add the service account email (found in the JSON file: `client_email`)
7. Permission: "Make changes to events"
8. Click "Send"

### Step 6: Update .env
Add to your `backend/.env` file:
```env
GOOGLE_SERVICE_ACCOUNT_KEY=./config/google-service-account.json
GOOGLE_CALENDAR_ID=primary
TIMEZONE=America/New_York
```

## ⚠️ Security Note
- **DO NOT** commit `google-service-account.json` to Git
- It's already in `.gitignore`
- Keep it secure and private

## ✅ Verification
After setup, test by creating a booking. The system will:
1. Generate Google Meet link automatically
2. Create calendar event
3. Send email with meeting link

If you see errors, check:
- Service account key path is correct
- Calendar is shared with service account
- APIs are enabled
- Service account has correct permissions

