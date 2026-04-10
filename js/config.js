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
    GOOGLE_MAPS_API_KEY: '',
    WHATSAPP_NUMBER: '528123509768',
    READY: false
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

            // Re-initialize Supabase client with real credentials
            // This must happen AFTER config is loaded, not before
            if (window.reinitializeSupabase) {
              const success = window.reinitializeSupabase();
              if (success) {
                console.log('✓ Supabase client re-initialized with API credentials');
              }
            }

            // Initialize Google Maps after config is ready
            initGoogleMapsAPI();
        } catch (error) {
            console.warn('⚠️ Failed to load config from API:', error);
            console.log('Using fallback configuration');
            window.NappanConfig.READY = true;

            // Try to initialize Supabase with fallback config
            // (only works if hardcoded defaults are present)
            if (window.reinitializeSupabase) {
              window.reinitializeSupabase();
            }

            // Still initialize Google Maps with whatever we have
            initGoogleMapsAPI();
        }
    })();

    return configLoadingPromise;
}

/**
 * Initialize Google Maps API dynamically from environment variables
 * This replaces hardcoded API keys in HTML <script> tags
 */
let googleMapsInitialized = false;

function initGoogleMapsAPI() {
    if (!window.NappanConfig?.GOOGLE_MAPS_API_KEY) {
        console.warn('⚠️ Google Maps API key not configured. Map features will be disabled.');
        return;
    }

    // Check if already loaded or initialization already in progress
    if (window.google?.maps || googleMapsInitialized) {
        return;
    }

    googleMapsInitialized = true;

    // Dynamically inject Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${window.NappanConfig.GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = function() {
        console.log('✓ Google Maps API loaded dynamically');
    };

    script.onerror = function() {
        console.error('❌ Failed to load Google Maps API. Check API key and quota.');
    };
}

// Load config immediately when script loads
loadConfig();
