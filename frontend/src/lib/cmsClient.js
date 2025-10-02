import { ENABLE_CMS, CMS_BASE_URL, CMS_API_TOKEN } from '../config/cms';

function withQuery(base, params) {
  const url = new URL(base, CMS_BASE_URL);
  Object.keys(params || {}).forEach(k => {
    const v = params[k];
    if (v === undefined || v === null || v === '') return;
    if (typeof v === 'object' && !Array.isArray(v)) {
      // nested like pagination[page]
      Object.entries(v).forEach(([kk, vv]) => {
        url.searchParams.set(`${k}[${kk}]`, String(vv));
      });
    } else {
      url.searchParams.set(k, String(v));
    }
  });
  return url.toString();
}

async function request(pathWithQuery) {
  if (!ENABLE_CMS || !CMS_BASE_URL) {
    return { ok: false, status: 0, json: null, error: 'CMS disabled' };
  }
  const res = await fetch(pathWithQuery, {
    headers: {
      'Accept': 'application/json',
      ...(CMS_API_TOKEN ? { Authorization: `Bearer ${CMS_API_TOKEN}` } : {})
    }
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (_) {}
  return { ok: res.ok, status: res.status, json, error: !res.ok ? text : null };
}

// Platforms
export async function fetchPlatforms(params = {}) {
  const query = withQuery('/api/platforms', {
    populate: 'logo',
    sort: params.sort || 'score:desc',
    pagination: {
      page: params.page || 1,
      pageSize: params.pageSize || 20
    }
  });
  const res = await request(query);
  if (!res.ok) return { data: [], meta: { pagination: { page: 1, pageSize: 20, pageCount: 1, total: 0 } }, error: res.error };
  return res.json;
}

export async function fetchPlatformBySlug(slug) {
  const query = withQuery('/api/platforms', {
    populate: 'logo',
    'filters[slug][$eq]': slug,
    'pagination[pageSize]': 1
  });
  const res = await request(query);
  if (!res.ok || !res.json?.data?.length) return null;
  return res.json.data[0];
}

// News
export async function fetchNews(params = {}) {
  const query = withQuery('/api/news', {
    sort: params.sort || 'timestamp:desc',
    pagination: {
      page: params.page || 1,
      pageSize: params.pageSize || 20
    }
  });
  const res = await request(query);
  if (!res.ok) return { data: [], meta: { pagination: { page: 1, pageSize: 20, pageCount: 1, total: 0 } }, error: res.error };
  return res.json;
}

export async function fetchNewsBySlug(slug) {
  const query = withQuery('/api/news', {
    'filters[slug][$eq]': slug,
    'pagination[pageSize]': 1
  });
  const res = await request(query);
  if (!res.ok || !res.json?.data?.length) return null;
  return res.json.data[0];
}
