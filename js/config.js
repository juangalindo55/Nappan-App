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
 */
async function loadConfig() {
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

        // Initialize Google Maps after config is ready
        initGoogleMapsAPI();
    } catch (error) {
        console.warn('⚠️ Failed to load config from API:', error);
        console.log('Using fallback configuration');
        window.NappanConfig.READY = true;
        // Still initialize Google Maps with whatever we have
        initGoogleMapsAPI();
    }
}

/**
 * Initialize Google Maps API dynamically from environment variables
 * This replaces hardcoded API keys in HTML <script> tags
 */
function initGoogleMapsAPI() {
    if (!window.NappanConfig?.GOOGLE_MAPS_API_KEY) {
        console.warn('⚠️ Google Maps API key not configured. Map features will be disabled.');
        return;
    }

    // Check if already loaded
    if (window.google?.maps) {
        return;
    }

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
