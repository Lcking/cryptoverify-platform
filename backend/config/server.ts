export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  // Public URL (needed when running behind a reverse proxy with HTTPS)
  // Set STRAPI_ADMIN_BACKEND_URL in .env.production, e.g. https://api.gambleverify.com
  url: env('STRAPI_ADMIN_BACKEND_URL', undefined),
  // Trust X-Forwarded-* headers from reverse proxy (Caddy/Nginx)
  proxy: true,
  app: {
    keys: env.array('APP_KEYS'),
  },
});
