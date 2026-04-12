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
 * Geocode origin address for shipping calculations
 * Uses Nominatim (free, OpenStreetMap) to convert address to coordinates
 * Results stored in window.NappanConfig for use by shipping calculators
 */
async function geocodeOriginAddress() {
  try {
    const originAddress = '64349, Monterrey, Mexico';
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(originAddress)}&format=json&limit=1`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) {
      throw new Error(`Nominatim returned status ${response.status}`);
    }

    const data = await response.json();
    if (data && data.length > 0) {
      window.NappanConfig.ORIGIN_LAT = parseFloat(data[0].lat);
      window.NappanConfig.ORIGIN_LON = parseFloat(data[0].lon);
      console.log(`✓ Origin geocoded: (${window.NappanConfig.ORIGIN_LAT}, ${window.NappanConfig.ORIGIN_LON})`);
    } else {
      throw new Error('Nominatim returned no results for origin address');
    }
  } catch (error) {
    console.warn('⚠️ Failed to geocode origin address:', error);
    // Fallback to default coordinates if geocoding fails
    window.NappanConfig.ORIGIN_LAT = 25.6866;
    window.NappanConfig.ORIGIN_LON = -100.3161;
    console.log('Using fallback origin coordinates');
  }
}

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

            // Geocode origin address for accurate shipping calculations
            await geocodeOriginAddress();

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
// Using OSRM for all distance calculations - no Google Maps needed
window.NappanConfig.readyPromise = loadConfig();
