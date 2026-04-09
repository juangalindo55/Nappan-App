/**
 * Nappan App - Environment Configuration
 * 
 * These values are injected by Vercel at build time from .env file (local)
 * or Vercel environment variables (production).
 * 
 * In development: Values come from .env file (gitignored)
 * In production: Values come from Vercel dashboard
 * 
 * ⚠️ IMPORTANT: Do NOT add secrets directly here. They MUST be in .env/.env.example
 */
window.NappanConfig = {
    SUPABASE_URL: process.env.SUPABASE_URL || 'http://localhost:54321',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
    WHATSAPP_NUMBER: process.env.WHATSAPP_NUMBER || '528123509768'
};

/**
 * Initialize Google Maps API dynamically from environment variables
 * This replaces hardcoded API keys in HTML <script> tags
 * Runs immediately to ensure Google Maps is available before other scripts
 */
(function initGoogleMapsAPI() {
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
})();
