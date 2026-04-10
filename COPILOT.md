# COPILOT.md - Nappan App Vercel Deployment & Environment Configuration

This document provides comprehensive guidance for Copilot CLI when working with the **Nappan** repository, with a focus on the Vercel deployment workflow and environment variable management.

## Project Overview

**Nappan** is a lifestyle brand app (Lunch Box, Nappan Box, Protein Fit Bar & Eventos en Vivo) built with pure HTML5, CSS3, and Vanilla JavaScript.

**Current Status:** Fully functional multi-page application deployed on Vercel with secure environment variable injection via serverless functions.

## Vercel Deployment & Environment Configuration (Phase 8)

### Problem Solved

Previously, hardcoded Supabase credentials in JavaScript posed security risks and made credential rotation impossible. The solution uses Vercel serverless functions to securely inject environment variables at request time.

### Architecture Components

#### 1. Vercel Serverless Function: `/api/config.js`

```javascript
module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const config = {
    SUPABASE_URL: process.env.SUPABASE_URL || 'http://localhost:54321',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
    WHATSAPP_NUMBER: process.env.WHATSAPP_NUMBER || '528123509768'
  };

  res.status(200).json(config);
};
```

**Key Points:**
- Runs on Vercel (not GitHub Pages—no env var support there)
- Returns JSON with 4 critical values
- Fallback values for localhost development
- Disables caching to ensure fresh values on redeploys
- CORS enabled for browser fetch requests

#### 2. Client-Side Bootstrap: `js/config.js`

Initializes `window.NappanConfig` with defaults, then fetches real values from `/api/config`:

```javascript
window.NappanConfig = {
    SUPABASE_URL: 'http://localhost:54321',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    GOOGLE_MAPS_API_KEY: '',
    WHATSAPP_NUMBER: '528123509768',
    READY: false
};

let configLoadingPromise = null;

async function loadConfig() {
    // Guard: Prevent multiple executions across page navigations
    if (window.NappanConfig.READY || configLoadingPromise) {
        return configLoadingPromise || Promise.resolve();
    }

    configLoadingPromise = (async () => {
        try {
            const response = await fetch('/api/config');
            Object.assign(window.NappanConfig, await response.json());
            window.NappanConfig.READY = true;

            // Re-init Supabase with real credentials
            if (window.reinitializeSupabase) {
                window.reinitializeSupabase();
            }

            // Load Google Maps once globally
            initGoogleMapsAPI();
        } catch (error) {
            console.warn('Failed to load config from API:', error);
            window.NappanConfig.READY = true;
            window.reinitializeSupabase?.();
            initGoogleMapsAPI();
        }
    })();

    return configLoadingPromise;
}

loadConfig();
```

**Key Points:**
- Runs immediately when page loads
- Promise-based to prevent duplicate executions
- Sets `READY` flag after success or fallback
- Calls `reinitializeSupabase()` to init client
- Calls `initGoogleMapsAPI()` once (with internal guard)

#### 3. Supabase Client Initialization: `js/supabase-client.js`

Exports the NappanDB API but only after client has real credentials:

```javascript
let supabaseClient = null;
let nappanDBReady = false;

function initializeSupabaseClient() {
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase CDN not loaded!');
        return false;
    }

    const url = window.NappanConfig?.SUPABASE_URL;
    const key = window.NappanConfig?.SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.warn('Supabase config not ready yet. Initialization deferred.');
        return false;
    }

    // Guard: Don't initialize with localhost fallback unless config is actually READY
    if (url === 'http://localhost:54321' && window.NappanConfig?.READY !== true) {
        console.log('Skipping Supabase init with localhost fallback; waiting for /api/config');
        return false;
    }

    try {
        supabaseClient = window.supabase.createClient(url, key);
        console.log('✓ Supabase client initialized with real credentials');

        // Only expose NappanDB once we have a real client
        if (!nappanDBReady) {
            window.NappanDB = NappanDBAPI;
            nappanDBReady = true;
            console.log('✓ NappanDB API exposed on window');
        }
        return true;
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        return false;
    }
}

window.reinitializeSupabase = initializeSupabaseClient;

// Attempt initialization immediately (will no-op with localhost until config loads)
initializeSupabaseClient();
```

**Key Points:**
- Waits for config.js to fetch and set READY flag
- Skips initialization if URL is localhost AND config not READY
- Exports `window.NappanDB` only after client creation succeeds
- Exposes getter-based `.supabase` property for auth module compatibility

#### 4. Page Scripts: Polling for NappanDB

All section pages and admin wait for client availability:

```javascript
// Wait for NappanDB to be exposed (happens after /api/config loads)
let maxAttempts = 100;
while (!window.NappanDB && maxAttempts > 0) {
    await new Promise(r => setTimeout(r, 100));
    maxAttempts--;
}

if (!window.NappanDB) {
    console.error('Supabase client no disponible después de 10 segundos');
    // Handle error gracefully
}

// Now safe to use window.NappanDB.loadProducts(), etc.
```

#### 5. Admin Modules: Async getDb()

Admin authentication and data modules have async `getDb()` that waits:

```javascript
async function getDb() {
    let maxAttempts = 100;
    while (!window.NappanDB && maxAttempts > 0) {
        await new Promise(r => setTimeout(r, 100));
        maxAttempts--;
    }
    if (!window.NappanDB) {
        throw new Error('Supabase client no disponible después de 10 segundos');
    }
    return window.NappanDB;
}
```

#### 6. Module Script Exposure: Admin Auth

Admin modules are exposed via `<script type="module">`:

```html
<script type="module">
import { Auth } from '../js/admin-modules/auth.js';
window.Auth = Auth;
</script>
```

Handlers wait for module availability:

```javascript
async function handleLogin(e) {
    e.preventDefault();

    // Wait for Auth module to be exposed
    let maxAttempts = 50;
    while ((!window.Auth || typeof window.Auth.login !== 'function') && maxAttempts > 0) {
        await new Promise(r => setTimeout(r, 100));
        maxAttempts--;
    }

    if (!window.Auth || typeof window.Auth.login !== 'function') {
        throw new Error('Auth module no disponible después de 5 segundos');
    }

    const result = await window.Auth.login(email, password);
}
```

#### 7. Google Maps: Single Global Load

`config.js` loads Google Maps once; `chatbot.js` waits for it:

**config.js:**
```javascript
let googleMapsInitialized = false;

function initGoogleMapsAPI() {
    if (!window.NappanConfig?.GOOGLE_MAPS_API_KEY) {
        console.warn('Google Maps API key not configured');
        return;
    }

    if (window.google?.maps || googleMapsInitialized) {
        return;
    }

    googleMapsInitialized = true;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${window.NappanConfig.GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}
```

**chatbot.js:**
```javascript
async loadGoogleMapsSDK() {
    // Wait for Google Maps to be loaded by config.js
    let maxAttempts = 100;
    while (!window.google?.maps && maxAttempts > 0) {
        await new Promise(r => setTimeout(r, 100));
        maxAttempts--;
    }
    if (!window.google?.maps) {
        console.warn('Google Maps not available after waiting');
    }
}
```

### Script Loading Sequence (Critical Order)

1. **HTML `<head>`** loads:
   - Supabase CDN: `@supabase/supabase-js`
   - `js/config.js` (starts async fetch, sets READY)
   - `js/supabase-client.js` (waits for READY before exposing NappanDB)

2. **Page Load** - Pages poll for `window.NappanDB` (10 sec timeout)

3. **Admin Page** - Module script runs after nappan-admin-v2.js, exposes `window.Auth`

4. **Handlers** wait for `window.Auth` before calling methods

### Why Each Guard Exists

| Guard | Location | Why | Breaks If Removed |
|-------|----------|-----|------------------|
| `if (NappanConfig.READY \|\| configLoadingPromise)` | config.js:loadConfig() | Prevent duplicate /api/config calls on page nav | Multiple Google Maps loads; race conditions |
| `if (url === 'localhost' && !READY)` | supabase-client.js:init() | Don't expose broken client with fallback | Pages use localhost client; fail to sync real credentials |
| `if (window.google?.maps \|\| googleMapsInitialized)` | config.js:initGoogleMapsAPI() | Prevent duplicate script tags | "Multiple Google Maps API" errors; internal JS errors |
| `while (!window.NappanDB)` | All pages | Wait for client exposure | "NappanDB is undefined" errors |
| `while (!window.Auth)` | Admin handlers | Wait for module script | "Auth module no disponible" errors |

### Deployment Checklist

#### 1. Set Vercel Environment Variables

In Vercel dashboard (Settings > Environment Variables):

```
SUPABASE_URL = https://[your-project].supabase.co
SUPABASE_ANON_KEY = sb_publishable_...
GOOGLE_MAPS_API_KEY = AIzaSy...
WHATSAPP_NUMBER = 52...
```

**Important:** Set scope to "All Environments" (not just Production).

#### 2. Verify `/api/config` Endpoint

```bash
curl https://your-vercel-deployment.vercel.app/api/config
# Should return JSON with your actual credentials, not localhost
```

#### 3. Test in Browser Console

```javascript
// After page load, check:
window.NappanConfig.READY  // Should be true
window.NappanConfig.SUPABASE_URL  // Should NOT be localhost
window.NappanDB  // Should exist
window.google.maps  // Should exist (no duplicates)
```

#### 4. Verify No Duplicates

- Console should show ONE load of Google Maps API
- No "Multiple Google Maps API" warnings
- No "Cannot read properties of undefined (reading 'VJ')" errors

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| `NappanDB is undefined` | Script loaded but client not exposed | Check console for config loading status; wait for READY |
| `Multiple Google Maps API` warnings | chatbot.js loading Maps or config.js called twice | Verify config.js has READY guard and googleMapsInitialized flag |
| `Cannot read properties of undefined (reading 'VJ')` | Maps API loaded but not initialized | Wait for window.google.maps before using Map() constructor |
| Page uses localhost credentials | /api/config not called or return failed | Check Network tab for /api/config response; verify Vercel env vars |
| Admin login fails with "Auth module no disponible" | Module script not exposed yet | Handlers have async wait; check console for timing |

### Testing Locally

```bash
# Terminal 1
.claude\serve.bat

# Terminal 2 (if testing Vercel functions locally)
vercel dev
```

Local testing uses fallback localhost values from config.js. To test Vercel deployment, use actual Vercel preview URL.

### Development Rules

1. **Never hardcode credentials** in JavaScript or HTML
2. **Never remove the guards** in config.js, supabase-client.js, or chatbot.js
3. **Always await** async methods like `getDb()`, `loadConfig()`, and `loadGoogleMapsSDK()`
4. **Always wait** for polling loops to complete before using exposed globals
5. **Test page navigation** to ensure no duplicate script loads
6. **Verify `/api/config`** returns correct Vercel env vars before debugging client issues

### Architecture Decision Rationale

- **Why Vercel functions?** Static sites can't use .env files; serverless functions bridge that gap
- **Why polling loops?** Config loading is async; synchronous code can't wait for it
- **Why multiple guards?** Page navigation reloads scripts; guards prevent cascading failures
- **Why `.READY` flag?** Distinguishes "fallback config" from "real config from API"
- **Why Google Maps guard?** Multiple calls to `initGoogleMapsAPI()` from config.js and chatbot.js need coordination

## File Structure Summary

```
Nappan-App/
├── api/
│   └── config.js           ← Vercel serverless function (env var injection)
├── js/
│   ├── config.js           ← Bootstrap: fetches /api/config, sets READY
│   ├── supabase-client.js  ← Init when READY; exposes window.NappanDB
│   ├── chatbot.js          ← Waits for window.google.maps
│   └── admin-modules/
│       ├── auth.js         ← Async getDb() wait
│       └── nappan-admin-v2.js  ← Async getDb() wait
├── pages/
│   ├── nappan-lunchbox.html     ← Polls window.NappanDB
│   ├── nappan-box.html          ← Polls window.NappanDB
│   ├── nappan-fitbar.html       ← Polls window.NappanDB
│   ├── nappan-eventos.html      ← Polls window.NappanDB
│   └── nappan-admin-v2.html     ← Waits for window.Auth
└── vercel.json             ← Build config (static site)
```

## Additional Resources

- See `CLAUDE.md` for full architecture details
- See `AGENTS.md` for coding standards
- See `GEMINI.md` for Spanish-language guidelines
- See `ENV_SETUP.md` for local development setup
- See `SECURITY_MIGRATION_COMPLETE.md` for security audit results

---

**Last Updated:** April 9, 2026
**Deployment Status:** Vercel production-ready
**Phase:** Phase 8 (Environment Configuration & Vercel Integration)
