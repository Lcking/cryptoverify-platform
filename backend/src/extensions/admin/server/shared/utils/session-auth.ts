import crypto from 'crypto';

declare const strapi: {
  config: {
    get: (path: string, defaultValue?: any) => any;
  };
  sessionManager?: any;
};

const REFRESH_COOKIE_NAME = 'strapi_admin_refresh';
const DEFAULT_MAX_REFRESH_TOKEN_LIFESPAN = 30 * 24 * 60 * 60;
const DEFAULT_IDLE_REFRESH_TOKEN_LIFESPAN = 14 * 24 * 60 * 60;
const DEFAULT_MAX_SESSION_LIFESPAN = 1 * 24 * 60 * 60;
const DEFAULT_IDLE_SESSION_LIFESPAN = 2 * 60 * 60;

const resolveCookieSecureFlag = () => {
  const configured = strapi.config.get('admin.auth.cookie.secure');
  if (configured !== undefined) {
    return Boolean(configured);
  }
  const isProduction = strapi.config.get('environment') === 'production';
  return isProduction;
};

const getRefreshCookieOptions = () => {
  const secure = resolveCookieSecureFlag();
  const domain =
    strapi.config.get('admin.auth.cookie.domain') ||
    strapi.config.get('admin.auth.domain') ||
    undefined;
  const path = strapi.config.get('admin.auth.cookie.path', '/admin');
  const sameSite = strapi.config.get('admin.auth.cookie.sameSite') ?? 'lax';

  return {
    httpOnly: true,
    secure,
    overwrite: true,
    domain,
    path,
    sameSite,
    maxAge: undefined,
  } as const;
};

const getLifespansForType = (type?: 'session' | 'refresh') => {
  const idleSeconds = Number(
    strapi.config.get(
      type === 'session'
        ? 'admin.auth.sessions.idleSessionLifespan'
        : 'admin.auth.sessions.idleRefreshTokenLifespan',
      type === 'session'
        ? DEFAULT_IDLE_SESSION_LIFESPAN
        : DEFAULT_IDLE_REFRESH_TOKEN_LIFESPAN
    )
  );
  const maxSeconds = Number(
    strapi.config.get(
      type === 'session'
        ? 'admin.auth.sessions.maxSessionLifespan'
        : 'admin.auth.sessions.maxRefreshTokenLifespan',
      type === 'session'
        ? DEFAULT_MAX_SESSION_LIFESPAN
        : DEFAULT_MAX_REFRESH_TOKEN_LIFESPAN
    )
  );

  return {
    idleSeconds,
    maxSeconds,
  };
};

const buildCookieOptionsWithExpiry = (
  type: 'session' | 'refresh',
  absoluteExpiresAtISO?: string
) => {
  const base = getRefreshCookieOptions();
  if (type === 'session') {
    return base;
  }

  const { idleSeconds } = getLifespansForType(type);
  const now = Date.now();
  const idleExpiry = now + idleSeconds * 1000;
  const absoluteExpiry = absoluteExpiresAtISO
    ? new Date(absoluteExpiresAtISO).getTime()
    : idleExpiry;
  const chosen = new Date(Math.min(idleExpiry, absoluteExpiry));

  return {
    ...base,
    expires: chosen,
    maxAge: Math.max(0, chosen.getTime() - now),
  };
};

const getSessionManager = () => {
  const manager = strapi.sessionManager;
  return manager ?? null;
};

const generateDeviceId = () => crypto.randomUUID();

const extractDeviceParams = (requestBody?: Record<string, unknown>) => {
  const body = requestBody ?? {};
  const deviceId = (body as { deviceId?: string }).deviceId || generateDeviceId();
  const rememberMe = Boolean((body as { rememberMe?: boolean }).rememberMe);

  return {
    deviceId,
    rememberMe,
  };
};

export {
  REFRESH_COOKIE_NAME,
  DEFAULT_MAX_REFRESH_TOKEN_LIFESPAN,
  DEFAULT_IDLE_REFRESH_TOKEN_LIFESPAN,
  DEFAULT_MAX_SESSION_LIFESPAN,
  DEFAULT_IDLE_SESSION_LIFESPAN,
  getRefreshCookieOptions,
  buildCookieOptionsWithExpiry,
  getSessionManager,
  generateDeviceId,
  extractDeviceParams,
};
