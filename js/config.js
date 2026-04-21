/**
 * Nappan App - Environment Configuration
 *
 * Loads configuration from /api/config endpoint
 *
 * In development: api/config.js reads from .env file (gitignored)
 * In production (Vercel): api/config.js reads from Vercel env vars
 *
 * ⚠️ IMPORTANT: Do NOT add secrets directly here. They MUST be in .env/.env.example
 */

// Initialize with fallback defaults while loading
window.NappanConfig = {
    SUPABASE_URL: 'http://localhost:54321',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    WHATSAPP_NUMBER: '528123509768',
    READY: false
};

/**
 * Hardcoded origin coordinates for CP 64349 (Cumbres, Monterrey)
 * Avoids rate-limiting issues and guarantees consistency.
 */
window.NappanConfig.ORIGIN_LAT = 25.750779;
window.NappanConfig.ORIGIN_LON = -100.421119;


/**
 * Loads the Google Maps SDK script once globally.
 * Returns a promise that resolves when the SDK is ready.
 */
let googleMapsLoadingPromise = null;
window.initGoogleMapsAPI = function() {
  if (window.google?.maps) return Promise.resolve();
  if (googleMapsLoadingPromise) return googleMapsLoadingPromise;

  googleMapsLoadingPromise = new Promise((resolve, reject) => {
    if (!window.NappanConfig.GOOGLE_MAPS_API_KEY) {
      console.warn('⚠️ No Google Maps API Key found in config');
      reject(new Error('Missing API Key'));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${window.NappanConfig.GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('✓ Google Maps SDK Loaded');
      resolve();
    };
    script.onerror = () => {
      console.error('⚠️ Failed to load Google Maps SDK');
      reject(new Error('SDK load error'));
    };
    document.head.appendChild(script);
  });

  return googleMapsLoadingPromise;
};


/**
 * Load configuration from API
 * This function fetches the actual credentials from /api/config
 * Only executes once globally to prevent duplicate Google Maps script injection
 */
let configLoadingPromise = null;

async function loadConfig() {
    // If already loading or loaded, return early
    if (window.NappanConfig.READY || configLoadingPromise) {
        return configLoadingPromise || Promise.resolve();
    }

    // Track that we're loading to prevent multiple concurrent executions
    configLoadingPromise = (async () => {
        try {
            const response = await fetch('/api/config');
            if (!response.ok) {
                throw new Error(`Config API returned status ${response.status}`);
            }

            const config = await response.json();

            // Merge with window.NappanConfig
            Object.assign(window.NappanConfig, config);
            window.NappanConfig.READY = true;

            console.log('✓ Configuration loaded from API');

            // Origin is now hardcoded above, no need to geocode from API

            // Re-initialize Supabase client with real credentials
            // This must happen AFTER config is loaded, not before
            if (window.reinitializeSupabase) {
              const success = window.reinitializeSupabase();
              if (success) {
                console.log('✓ Supabase client re-initialized with API credentials');
              }
            }

        } catch (error) {
            console.warn('⚠️ Failed to load config from API:', error);
            console.log('Using fallback configuration');
            window.NappanConfig.READY = true;

            // Try to initialize Supabase with fallback config
            // (only works if hardcoded defaults are present)
            if (window.reinitializeSupabase) {
              window.reinitializeSupabase();
            }
        }
    })();

    return configLoadingPromise;
}

// Load config immediately when script loads
window.NappanConfig.readyPromise = loadConfig();
