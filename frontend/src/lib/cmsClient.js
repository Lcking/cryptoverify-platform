// Lightweight CMS client placeholder
// Later, replace baseURL with process.env.REACT_APP_CMS_URL and add real fetchers

// const baseURL = process.env.REACT_APP_CMS_URL || 'http://localhost:1337';

export async function fetchPlatforms(params = {}) {
  // TODO: implement with Strapi filter/sort/pagination
  // Example: `${baseURL}/api/platforms?populate=logo&sort=score:desc&pagination[page]=1&pagination[pageSize]=20`
  return { data: [], meta: { pagination: { page: 1, pageSize: 20, pageCount: 1, total: 0 } } };
}

export async function fetchPlatformBySlug(slug) {
  // Example: `${baseURL}/api/platforms?filters[slug][$eq]=${slug}&populate=logo`
  return null;
}

export async function fetchNews(params = {}) {
  return { data: [], meta: { pagination: { page: 1, pageSize: 20, pageCount: 1, total: 0 } } };
}

export async function fetchNewsBySlug(slug) {
  return null;
}
