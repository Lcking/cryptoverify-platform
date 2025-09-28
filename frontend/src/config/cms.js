// CMS (Strapi) configuration for direct submission storage
// Set ENABLE_CMS=true after you deploy Strapi and create the content type

export const ENABLE_CMS = false;

// Example: http://localhost:1337 or https://cms.example.com
export const CMS_BASE_URL = '';

// Strapi collection type API path, e.g., /api/submissions (create this collection)
export const CMS_SUBMISSIONS_API = '/api/submissions';
export const CMS_SEARCH_API = '/api/search';

// If your Strapi requires an API token, put it here (read/write)
// Create a token in Strapi: Settings → API Tokens
export const CMS_API_TOKEN = '';
