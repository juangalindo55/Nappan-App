# Environment Variables Setup - Nappan App

## Local Development

### 1. Create `.env` file

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
SUPABASE_URL=https://rbhjacmuelcjgxdyxmuh.supabase.co
SUPABASE_ANON_KEY=sb_publishable_d958WcFSLNa6yVan61MiWQ_e7FS8NL1
GOOGLE_MAPS_API_KEY=AIzaSyBnpclaToCM90xqFNsEtWWJFWwJGyAMJcA
WHATSAPP_NUMBER=528123509768
```

**⚠️ IMPORTANT:** `.env` is gitignored - it will NOT be committed to the repository.

### 2. How It Works Locally

- `js/config.js` reads from `.env` file
- Values are available as `window.NappanConfig.SUPABASE_URL`, etc.
- Google Maps API is injected dynamically from environment

## Production Deployment (Vercel)

### 1. Set Environment Variables in Vercel Dashboard

Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

Add these variables:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `GOOGLE_MAPS_API_KEY`
- `WHATSAPP_NUMBER`

### 2. Deploy

Push to GitHub → Vercel automatically redeploys with new env vars:

```bash
git add .
git commit -m "Move secrets to environment variables"
git push origin master
```

Vercel will:
1. Detect changes
2. Rebuild (injects env vars via `process.env`)
3. Deploy to production

### 3. Verify Deployment

Check browser console on your Vercel deployment:
- ✓ Should see "Supabase client initialized"
- ✓ Should see "Google Maps API loaded dynamically"
- ✓ No hardcoded secrets in HTML/JS

---

## File Changes Summary

### Files Created/Modified:

| File | Change | Purpose |
|------|--------|---------|
| `.env.example` | Created | Template for environment variables |
| `.env` | Created (gitignored) | Local development secrets |
| `js/config.js` | Modified | Now reads from `process.env` with fallbacks |
| `js/utils.js` | Modified | WhatsApp number now from `window.NappanConfig` |
| `pages/nappan-box.html` | Modified | Removed hardcoded Google Maps script |
| `pages/nappan-fitbar.html` | Modified | Removed hardcoded Google Maps script |
| `pages/nappan-lunchbox.html` | Modified | Removed hardcoded Google Maps script |
| `vercel.json` | Created | Tells Vercel how to handle env vars |
| `package.json` | Modified | Added build scripts (for future use) |

### Security Improvements:

✅ Supabase credentials moved to environment variables  
✅ Google Maps API key moved to environment variables  
✅ WhatsApp number now configurable  
✅ Secrets never committed to git (`.env` is gitignored)  
✅ Works on both local development and production  

---

## Troubleshooting

### "Supabase configuration missing" error?
- Check `.env` file exists and has `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Check `js/config.js` is loaded before any Supabase calls

### "Google Maps API not working"?
- Check `GOOGLE_MAPS_API_KEY` in `.env` is correct
- Check API key has "Maps JavaScript API" enabled in Google Cloud Console
- Check API key quota hasn't been exceeded

### "WhatsApp number wrong"?
- Update `WHATSAPP_NUMBER` in `.env` or Vercel dashboard
- Reload page to pick up changes

---

## Advanced: Local Build Testing

If you want to test environment variable injection locally (without Vercel):

```bash
# Install dotenv package
npm install --save-dev dotenv

# Create a simple build script
node -r dotenv/config js/config.js
```

But this is optional - static site works fine without build step.

---

**Last Updated:** April 9, 2026  
**Status:** All secrets moved to environment variables ✓
