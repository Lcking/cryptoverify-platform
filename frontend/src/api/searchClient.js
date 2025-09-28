import { ENABLE_CMS, CMS_BASE_URL, CMS_SEARCH_API, CMS_API_TOKEN } from '../config/cms';

export async function searchAll(query) {
  if (!query || !query.trim()) return { ok: true, data: emptyResult() };
  if (!ENABLE_CMS || !CMS_BASE_URL) return { ok: false, error: 'CMS disabled' };
  try {
    const url = new URL(CMS_SEARCH_API, CMS_BASE_URL).toString();
    const res = await fetch(`${url}?q=${encodeURIComponent(query)}`, {
      headers: {
        ...(CMS_API_TOKEN ? { Authorization: `Bearer ${CMS_API_TOKEN}` } : {})
      }
    });
    if (!res.ok) {
      const t = await res.text();
      return { ok: false, error: `Search API ${res.status}: ${t}` };
    }
    const json = await res.json();
    return { ok: true, data: normalize(json) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function emptyResult() {
  return { platforms: [], news: [], insights: [], exposure: [], verifications: [] };
}

// Normalize server payload into {platforms, news, insights, exposure, verifications}
function normalize(payload) {
  const out = emptyResult();
  if (!payload) return out;
  return {
    platforms: payload.platforms || [],
    news: payload.news || [],
    insights: payload.insights || [],
    exposure: payload.exposure || [],
    verifications: payload.verifications || []
  };
}
