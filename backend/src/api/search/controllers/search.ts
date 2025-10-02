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
        filters: { $or: [{ title: { $containsi: q } }, { slug: { $containsi: q } }] },
        fields: ['id', 'title', 'slug', 'publishedAt', 'platformSlug'],
        limit: 10,
      }).catch(() => []),
    ]);

    ctx.body = {
      platforms,
      news,
      insights: [],
      exposure: exposures,
      verifications,
    };
  },
};
