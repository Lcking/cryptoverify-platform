import type { Context } from 'koa';

export default {
  async index(ctx: Context) {
    const qRaw = ctx.request.query.q;
    const q = typeof qRaw === 'string' ? qRaw.trim() : '';

    if (!q) {
      ctx.body = { platforms: [], news: [], insights: [], exposure: [], verifications: [] };
      return;
    }

    const entityService = strapi.entityService;

  const [platforms, news, exposures, verifications] = await Promise.all([
      entityService.findMany('api::platform.platform' as any, {
        filters: { $or: [{ name: { $containsi: q } }, { slug: { $containsi: q } }] },
        fields: ['id', 'name', 'slug', 'score'],
        populate: { logo: true },
        limit: 10,
      }).catch(() => []),
      entityService.findMany('api::news.news' as any, {
        filters: { $or: [{ title: { $containsi: q } }, { slug: { $containsi: q } }] },
        fields: ['id', 'title', 'slug', 'timestamp'],
        limit: 10,
      }).catch(() => []),
      entityService.findMany('api::exposure.exposure' as any, {
        filters: { $or: [{ platform: { $containsi: q } }, { slug: { $containsi: q } }] },
        fields: ['id', 'platform', 'slug', 'severity', 'type', 'status', 'reportedDate'],
        limit: 10,
      }).catch(() => []),
      entityService.findMany('api::verification.verification' as any, {
        filters: {
          $or: [
            { title: { $containsi: q } },
            { slug: { $containsi: q } },
            { platform: { slug: { $containsi: q } } },
            { platform: { name: { $containsi: q } } },
          ],
        },
        fields: ['id', 'title', 'slug', 'publishedAt'],
        populate: { platform: { fields: ['slug', 'name'] } },
        sort: { publishedAt: 'desc' },
        limit: 10,
      }).catch(() => []),
    ]);

    // 规范化 verifications 平台关系
    const normalizedVerifications = (verifications as any[]).map((v) => {
      const a = (v as any).attributes || v || {};
      const plat = a.platform;
      let platformSlug = '';
      let platformName = '';
      if (plat) {
        if (plat.data) {
          const node = Array.isArray(plat.data) ? plat.data[0] : plat.data;
          const pa = (node as any)?.attributes || (node as any) || {};
          platformSlug = pa.slug || '';
          platformName = pa.name || '';
        } else if (typeof plat === 'object') {
          platformSlug = (plat as any).slug || '';
          platformName = (plat as any).name || '';
        }
      }
      return {
        id: a.id || v.id,
        slug: a.slug || v.slug,
        title: a.title || v.title,
        publishedAt: a.publishedAt || a.verifiedAt || a.releasedAt || a.createdAt || v.publishedAt || '',
        platform: { slug: platformSlug, name: platformName },
      };
    });

    ctx.body = {
      platforms,
      news,
      insights: [],
      exposure: exposures,
      verifications: normalizedVerifications,
      meta: { verifications: { total: normalizedVerifications.length } },
    };
  },
};
