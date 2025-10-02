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

function toTimestampIso(v) {
  if (v == null) return '';
  // if already a valid date string
  const t = typeof v === 'string' ? Date.parse(v) : (typeof v === 'number' ? v : NaN);
  if (!Number.isNaN(t)) {
    // If it's a small number likely in seconds, convert to ms
    const ms = (typeof v === 'number' && v < 1e12) ? v * 1000 : (typeof v === 'number' ? v : t);
    const d = new Date(ms);
    return isNaN(d.getTime()) ? '' : d.toISOString();
  }
  return '';
}

// Normalize server payload into {platforms, news, insights, exposure, verifications}
function normalize(payload) {
  const out = emptyResult();
  if (!payload) return out;
  const platforms = Array.isArray(payload.platforms) ? payload.platforms.map(p => ({
    slug: p.slug,
    name: p.name,
    score: p.score,
    verified: p.verified,
  })) : [];
  const news = Array.isArray(payload.news) ? payload.news.map(n => ({
    slug: n.slug,
    title: n.title,
    timestamp: toTimestampIso(n.timestamp || n.publishedAt || n.createdAt),
  })) : [];
  const insights = Array.isArray(payload.insights) ? payload.insights.map(i => ({
    slug: i.slug,
    title: i.title,
    author: i.author,
    timestamp: toTimestampIso(i.timestamp || i.publishedAt || i.createdAt),
  })) : [];
  const exposure = Array.isArray(payload.exposure) ? payload.exposure.map(e => ({
    slug: e.slug,
    platform: e.platform,
    type: e.type || e.exposureType,
    severity: e.severity,
    reportedDate: toTimestampIso(e.reportedDate || e.createdAt),
  })) : [];
  const verifications = Array.isArray(payload.verifications) ? payload.verifications.map(v => ({
    slug: v.slug,
    title: v.title,
    publishedAt: toTimestampIso(v.publishedAt || v.verifiedAt || v.releasedAt || v.createdAt || v.timestamp),
  })) : [];
  return { platforms, news, insights, exposure, verifications };
}
