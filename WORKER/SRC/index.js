/**
 * FURNALITY NETWORK — CLOUDFLARE WORKER API
 * Interrogation de la base Cloudflare D1 avec CORS sécurisés.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Endpoint pour alimenter le footer
    if (url.pathname === '/api/footer-links') {
      try {
        const { results } = await env.DB.prepare(
          "SELECT id, label, url FROM footer_links ORDER BY id ASC"
        ).all();

        return new Response(JSON.stringify(results), {
          headers: corsHeaders
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    return new Response(JSON.stringify({ message: 'Endpoint inconnu' }), { 
      status: 404,
      headers: corsHeaders
    });
  }
};