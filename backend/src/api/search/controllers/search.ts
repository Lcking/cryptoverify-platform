import type { Context } from 'koa';

export default {
  async index(ctx: Context) {
    const qRaw = ctx.request.query.q;
    const q = typeof qRaw === 'string' ? qRaw.trim() : '';

    if (!q) {
      ctx.body = { platforms: [], news: [], insights: [], exposure: [], verifications: [], meta: { platforms: { total: 0 }, news: { total: 0 }, insights: { total: 0 }, exposure: { total: 0 }, verifications: { total: 0 } } };
      return;
    }

    const entityService = strapi.entityService;
    // 查询各集合（平台、新闻、曝光、验证、洞察）
    const [platforms, news, exposures, verifications, insights] = await Promise.all([
      entityService.findMany('api::platform.platform' as any, ({
        filters: { $or: [{ name: { $containsi: q } }, { slug: { $containsi: q } }] },
        fields: ['id', 'name', 'slug', 'score'],
        populate: { logo: true },
        sort: { score: 'desc' },
        limit: 10,
      } as any)).catch(() => []),
      // 注意：新闻内容类型 UID 为 api::news-item.news-item（路由仍为 /api/news）
      entityService.findMany('api::news-item.news-item' as any, ({
        filters: {
          $or: [
            { title: { $containsi: q } },
            { slug: { $containsi: q } },
            { platformSlug: { $containsi: q } },
            { excerpt: { $containsi: q } },
          ],
        },
        fields: ['id', 'title', 'slug', 'timestamp', 'platformSlug', 'excerpt'],
        sort: { timestamp: 'desc' },
        limit: 10,
      } as any)).catch(() => []),
      entityService.findMany('api::exposure.exposure' as any, ({
        filters: {
          $or: [
            { platform: { $containsi: q } },
            { slug: { $containsi: q } },
            { summary: { $containsi: q } },
          ],
        },
        fields: ['id', 'platform', 'slug', 'severity', 'exposureType', 'caseStatus', 'reportedDate', 'summary'],
        sort: [{ reportedDate: 'desc' }, { createdAt: 'desc' }],
        limit: 10,
      } as any)).catch(() => []),
      entityService.findMany('api::verification.verification' as any, ({
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
      } as any)).catch(() => []),
      entityService.findMany('api::insight.insight' as any, ({
        filters: {
          $or: [
            { title: { $containsi: q } },
            { slug: { $containsi: q } },
            { category: { $containsi: q } },
            { author: { $containsi: q } },
            { excerpt: { $containsi: q } },
          ],
        },
        fields: ['id', 'title', 'slug', 'category', 'author', 'timestamp', 'excerpt'],
        sort: { timestamp: 'desc' },
        limit: 10,
      } as any)).catch(() => []),
    ]);

    const safeAttr = (item: any) => (item?.attributes ? item.attributes : item) || {};

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

    // 规范化 news
    const normalizedNews = (news as any[]).map((n) => {
      const a = safeAttr(n);
      return {
        id: a.id || n.id,
        slug: a.slug || n.slug,
        title: a.title || n.title,
        timestamp: a.timestamp || a.publishedAt || a.createdAt || '',
        platformSlug: a.platformSlug || '',
        excerpt: a.excerpt || '',
      };
    });

    // 规范化 exposure
    const normalizedExposures = (exposures as any[]).map((e) => {
      const a = safeAttr(e);
      return {
        id: a.id || e.id,
        slug: a.slug || e.slug,
        platform: a.platform || '',
        severity: a.severity || '',
        exposureType: a.exposureType || a.type || '',
        // 兼容前端 UI 使用的 r.type 字段
        type: a.exposureType || a.type || '',
        caseStatus: a.caseStatus || a.status || '',
        reportedDate: a.reportedDate || a.lastUpdate || a.createdAt || '',
        summary: a.summary || '',
      };
    });

    // 规范化 insights
    const normalizedInsights = (insights as any[]).map((i) => {
      const a = safeAttr(i);
      return {
        id: a.id || i.id,
        slug: a.slug || i.slug,
        title: a.title || i.title,
        category: a.category || '',
        author: a.author || '',
        timestamp: a.timestamp || a.publishedAt || a.createdAt || '',
        excerpt: a.excerpt || '',
      };
    });

    ctx.body = {
      platforms,
      news: normalizedNews,
      insights: normalizedInsights,
      exposure: normalizedExposures,
      verifications: normalizedVerifications,
      meta: {
        platforms: { total: Array.isArray(platforms) ? platforms.length : 0 },
        news: { total: normalizedNews.length },
        insights: { total: normalizedInsights.length },
        exposure: { total: normalizedExposures.length },
        verifications: { total: normalizedVerifications.length },
      },
    };
  },
};
