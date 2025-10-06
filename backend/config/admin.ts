export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
    sessions: {
      cookie: {
        secure: env.bool('ADMIN_SESSION_COOKIE_SECURE', true),
        sameSite: env('ADMIN_SESSION_COOKIE_SAMESITE', 'lax'),
        path: env('ADMIN_SESSION_COOKIE_PATH', '/admin'),
        domain: env('ADMIN_SESSION_COOKIE_DOMAIN'),
      },
    },
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
  url: env('ADMIN_URL', '/admin'),
});
