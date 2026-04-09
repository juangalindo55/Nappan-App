/**
 * Vercel Edge Function - Config API
 *
 * This function injects environment variables from Vercel into the client
 * It's called by js/config.js at runtime to load credentials
 *
 * URL: /api/config
 */

export default function handler(req, res) {
  // CORS headers for client-side fetch
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');

  // Return environment variables as JSON
  // On Vercel: values come from dashboard env vars
  // Locally: values come from .env file
  const config = {
    SUPABASE_URL: process.env.SUPABASE_URL || 'http://localhost:54321',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
    WHATSAPP_NUMBER: process.env.WHATSAPP_NUMBER || '528123509768'
  };

  res.status(200).json(config);
}
