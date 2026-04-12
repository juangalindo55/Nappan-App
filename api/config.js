/**
 * Vercel Serverless Function - Config API
 *
 * This function injects environment variables from Vercel into the client
 * It's called by js/config.js at runtime to load credentials
 *
 * URL: /api/config
 */

module.exports = function handler(req, res) {
  // CORS headers for client-side fetch
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');

  // Disable caching - environment variables change and we need fresh values
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Return public environment variables only (NEXT_PUBLIC_* prefix)
  // Private variables (GOOGLE_MAPS_API_KEY, WHATSAPP_NUMBER) should NOT be exposed to client
  const config = {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
  };

  res.status(200).json(config);
};
