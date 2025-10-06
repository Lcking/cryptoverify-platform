export default ({ env }) => ([
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:', 'http:', 'localhost:1337'],
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        env('FRONTEND_ORIGIN', ''),
        // Legacy domain kept for backward-compat if needed
        'https://cryptoverify.com',
        // Current app domain
        'https://app.gambleverify.com',
      ].filter(Boolean),
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  {
    name: 'strapi::session',
    config: {
      // Force disable secure flag to bypass HTTPS detection issue with Strapi 5.25
      cookie: {
        secure: false,
        httpOnly: true,
        sameSite: env('SESSION_SAMESITE', 'lax'),
        domain: env('SESSION_DOMAIN', undefined),
        path: '/',
      },
    },
  },
  'strapi::favicon',
  'strapi::public',
]);
