// CMS (Strapi) configuration
// Prefer environment variables for CRA (must start with REACT_APP_)
// REACT_APP_ENABLE_CMS=true
// REACT_APP_CMS_URL=https://cms.example.com
// REACT_APP_CMS_TOKEN=<token-if-needed>

export const ENABLE_CMS = String(process.env.REACT_APP_ENABLE_CMS || '').toLowerCase() === 'true';

// Example: http://localhost:1337 or https://cms.example.com
export const CMS_BASE_URL = process.env.REACT_APP_CMS_URL || '';

// Strapi collection type API path, e.g., /api/submissions (create this collection)
export const CMS_SUBMISSIONS_API = '/api/submissions';
export const CMS_SEARCH_API = '/api/search';

// If your Strapi requires an API token, put it here (read/write)
// Create a token in Strapi: Settings → API Tokens
export const CMS_API_TOKEN = process.env.REACT_APP_CMS_TOKEN || '';
