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

// Normalizers to align CMS attributes with front-end expectations
function toArray(v) {
  if (Array.isArray(v)) return v;
  if (!v) return [];
  // if it's a string with newline-separated entries
  if (typeof v === 'string') return v.split('\n').map(s => s.trim()).filter(Boolean);
  return [v];
}

// Ensure absolute media URL
function toAbsoluteUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  // Strapi returns relative URLs for local uploads, prefix with CMS_BASE_URL
  return `${CMS_BASE_URL}${url}`;
}

function pickMediaUrl(m) {
  if (!m) return '';
  // v4 populated media: { data: { attributes: { url } } } 或 { data: [ ... ] }
  if (m.data) {
    const node = Array.isArray(m.data) ? m.data[0] : m.data;
    const a = node?.attributes || node || {};
    return toAbsoluteUrl(a.url);
  }
  // v5 populated media: 直接是 { id, url, ... }
  if (typeof m === 'object' && m.url) return toAbsoluteUrl(m.url);
  // 有时直接存储了 URL 字符串
  if (typeof m === 'string') return toAbsoluteUrl(m);
  return '';
}

// Convert possible rich-text JSON (Strapi blocks) to minimal HTML paragraphs
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function extractText(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractText).join(' ');
  // Common shapes: { type, children: [...] } or { text }
  if (typeof node.text === 'string') return node.text;
  if (Array.isArray(node.children)) return node.children.map(extractText).join(' ');
  // Lists: { type: 'list', format: 'unordered'|'ordered', children: [ { type:'list-item', children:[...] } ] }
  if (node.type === 'list' && Array.isArray(node.children)) {
    return node.children.map((li) => `• ${extractText(li)}`).join('\n');
  }
  // Headings/paragraphs/quotes fallback
  if (typeof node === 'object') {
    const vals = Object.values(node).map(extractText).filter(Boolean);
    return vals.join(' ');
  }
  return '';
}

function nodesToHtml(value) {
  try {
    if (typeof value === 'string') return value;
    if (!value) return '';
    const parts = Array.isArray(value) ? value.map(extractText) : [extractText(value)];
    const blocks = parts.join('\n')
      .split(/\n{2,}/)
      .map(s => s.trim())
      .filter(Boolean)
      .map(t => `<p>${escapeHtml(t)}</p>`);
    return blocks.join('\n');
  } catch (_) {
    // As last resort, stringify safely
    try { return `<p>${escapeHtml(JSON.stringify(value))}</p>`; } catch { return ''; }
  }
}

function normalizePlatform(entity) {
  const a = entity?.attributes || entity || {};
  const contentRaw = a.content || a.descriptionHtml || a.description || '';
  return {
    id: entity?.id,
    slug: a.slug || '',
    name: a.name || '',
    score: typeof a.score === 'number' ? a.score : (a.score ? Number(a.score) : undefined),
    business: a.business || '',
    summary: a.summary || '',
    pairs: typeof a.pairs === 'number' ? a.pairs : (a.pairs ? Number(a.pairs) : undefined),
    volume: a.volume || '',
    established: typeof a.established === 'number' ? a.established : (a.established ? Number(a.established) : undefined),
    logo: pickMediaUrl(a.logo),
    websiteUrl: a.websiteUrl || '',
    // 富文本内容（可选）：优先 content，其次 descriptionHtml/description
    content: typeof contentRaw === 'string' ? contentRaw : nodesToHtml(contentRaw),
  };
}

function normalizeExposure(entity) {
  // Strapi v4: entity = { id, attributes: { ...fields } }
  // Strapi v5: entity = { id, documentId, ...fields }（已扁平化，不再有 attributes）
  const a = entity?.attributes || entity || {};
  return {
    id: entity?.id,
    slug: a.slug || '',
    platform: a.platform || '',
    // 避免与通用名 type 潜在冲突，若使用 exposureType 亦可兼容
    type: a.type || a.exposureType || '',
    severity: a.severity || '',
    // Strapi 保留名冲突：优先使用自定义的 caseStatus/exposureStatus，其次才回退到 status
    status: a.caseStatus || a.exposureStatus || a.status || '',
    reportedDate: a.reportedDate || a.createdAt || '',
    summary: a.summary || '',
    evidence: toArray(a.evidence),
    riskFactors: toArray(a.riskFactors),
    reporterCount: typeof a.reporterCount === 'number' ? a.reporterCount : 0,
    lastUpdate: a.lastUpdate || a.updatedAt || '',
  };
}

function normalizeVerification(entity) {
  // 兼容 v4/v5：优先 attributes，否则使用扁平化实体
  const a = entity?.attributes || entity || {};
  const contentRaw = a.content || a.contentHtml || a.body || '';
  // platform relation normalize (v4: a.platform.data.attributes.slug, v5: a.platform.slug)
  let platformSlug = a.platformSlug || '';
  let platformName = '';
  const plat = a.platform;
  if (plat) {
    if (plat.data) {
      const node = Array.isArray(plat.data) ? plat.data[0] : plat.data;
      const pa = node?.attributes || node || {};
      platformSlug = pa.slug || platformSlug;
      platformName = pa.name || platformName;
    } else if (typeof plat === 'object') {
      platformSlug = plat.slug || platformSlug;
      platformName = plat.name || platformName;
    }
  }
  return {
    id: entity?.id,
    slug: a.slug || '',
    title: a.title || '',
    // publishedAt 是 Strapi 内建字段（启用 Draft & Publish 后），切勿自建同名字段。
    // 如需自管发布时间，建议使用 verifiedAt/releasedAt，并在此回退。
    publishedAt: a.publishedAt || a.verifiedAt || a.releasedAt || a.createdAt || '',
    platformSlug,
    platformName,
    content: typeof contentRaw === 'string' ? contentRaw : nodesToHtml(contentRaw),
  };
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
  const raw = res.json?.data || [];
  const data = raw.map(normalizePlatform);
  return { ...res.json, data };
}

export async function fetchPlatformBySlug(slug) {
  const query = withQuery('/api/platforms', {
    populate: 'logo',
    'filters[slug][$eq]': slug,
    'pagination[pageSize]': 1
  });
  const res = await request(query);
  if (!res.ok || !res.json?.data?.length) return null;
  return normalizePlatform(res.json.data[0]);
}

// Exposure
export async function fetchExposures(params = {}) {
  const query = withQuery('/api/exposures', {
    sort: params.sort || 'reportedDate:desc',
    pagination: {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
    }
  });
  const res = await request(query);
  if (!res.ok) return { data: [], meta: { pagination: { page: 1, pageSize: 20, pageCount: 1, total: 0 } }, error: res.error };
  const data = (res.json?.data || []).map(normalizeExposure);
  return { ...res.json, data };
}

export async function fetchExposureBySlug(slug) {
  const query = withQuery('/api/exposures', {
    'filters[slug][$eq]': slug,
    'pagination[pageSize]': 1,
  });
  const res = await request(query);
  if (!res.ok || !res.json?.data?.length) return null;
  return normalizeExposure(res.json.data[0]);
}

// Verifications
export async function fetchVerifications(params = {}) {
  const queryParams = {
    populate: 'platform',
    sort: params.sort || 'publishedAt:desc',
    pagination: {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
    },
  };
  if (params.platformSlug) {
    // final relation-based filter
    queryParams['filters[platform][slug][$eq]'] = params.platformSlug;
  }
  if (params.filters && typeof params.filters === 'object') {
    Object.assign(queryParams, params.filters);
  }
  const query = withQuery('/api/verifications', queryParams);
  const res = await request(query);
  if (!res.ok) return { data: [], meta: { pagination: { page: 1, pageSize: 20, pageCount: 1, total: 0 } }, error: res.error };
  const data = (res.json?.data || []).map(normalizeVerification);
  return { ...res.json, data };
}

export async function fetchVerificationBySlug(slug) {
  const query = withQuery('/api/verifications', {
    populate: 'platform',
    'filters[slug][$eq]': slug,
    'pagination[pageSize]': 1,
  });
  const res = await request(query);
  if (!res.ok || !res.json?.data?.length) return null;
  return normalizeVerification(res.json.data[0]);
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
  const raw = res.json?.data || [];
  const data = raw.map((entity) => {
    const a = entity?.attributes || entity || {};
    return {
      id: entity?.id,
      slug: a.slug || '',
      title: a.title || '',
      content: a.content || a.excerpt || '',
      source: a.source || 'News',
      timestamp: a.timestamp || a.publishedAt || a.createdAt || '',
      tags: Array.isArray(a.tags) ? a.tags : (a.tags ? toArray(a.tags) : []),
    };
  });
  return { ...res.json, data };
}

export async function fetchNewsBySlug(slug) {
  const query = withQuery('/api/news', {
    'filters[slug][$eq]': slug,
    'pagination[pageSize]': 1
  });
  const res = await request(query);
  if (!res.ok || !res.json?.data?.length) return null;
  const entity = res.json.data[0];
  const a = entity?.attributes || entity || {};
  return {
    id: entity?.id,
    slug: a.slug || '',
    title: a.title || '',
    content: a.content || a.excerpt || '',
    source: a.source || 'News',
    timestamp: a.timestamp || a.publishedAt || a.createdAt || '',
    tags: Array.isArray(a.tags) ? a.tags : (a.tags ? toArray(a.tags) : []),
  };
}

// Insights
function normalizeInsight(entity) {
  const a = entity?.attributes || entity || {};
  const contentRaw = a.content || a.contentHtml || a.body || '';
  return {
    id: entity?.id,
    slug: a.slug || '',
    title: a.title || '',
    category: a.category || '',
    author: a.author || '',
    excerpt: a.excerpt || '',
    content: typeof contentRaw === 'string' ? contentRaw : nodesToHtml(contentRaw),
    timestamp: a.timestamp || a.publishedAt || a.createdAt || '',
    read: a.read || '',
  };
}

export async function fetchInsights(params = {}) {
  const query = withQuery('/api/insights', {
    sort: params.sort || 'timestamp:desc',
    pagination: {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
    },
  });
  const res = await request(query);
  if (!res.ok) return { data: [], meta: { pagination: { page: 1, pageSize: 20, pageCount: 1, total: 0 } }, error: res.error };
  const data = (res.json?.data || []).map(normalizeInsight);
  return { ...res.json, data };
}

export async function fetchInsightBySlug(slug) {
  const query = withQuery('/api/insights', {
    'filters[slug][$eq]': slug,
    'pagination[pageSize]': 1,
  });
  const res = await request(query);
  if (!res.ok || !res.json?.data?.length) return null;
  return normalizeInsight(res.json.data[0]);
}
