import React, { useState, useEffect } from 'react';
import PageLayout from '../layout/PageLayout';
import Breadcrumbs from '../ui/Breadcrumbs';
import { Link } from 'react-router-dom';
import { news as sharedNews } from '../../data/mock';
import { fetchNews } from '../../lib/cmsClient';
import MasonryLayout from '../ui/MasonryLayout';
import siteContent from '../../config/siteContent';

const NewsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const mock = sharedNews;

  useEffect(() => {
    let mounted = true;
    async function load(pageNum = 1) {
      setLoading(true);
      try {
        const res = await fetchNews({ page: pageNum, pageSize: 20 });
        if (!mounted) return;
        if (res?.data?.length) {
          // Strapi v4 shape: { data: [{ id, attributes: { title, slug, ... }}] }
          const mapped = res.data.map(d => ({
            id: d.id,
            slug: d.attributes?.slug,
            title: d.attributes?.title,
            content: d.attributes?.content || d.attributes?.excerpt || '',
            source: d.attributes?.source || 'News',
            timestamp: d.attributes?.timestamp || d.attributes?.publishedAt || new Date().toISOString(),
            tags: d.attributes?.tags || []
          }));
          setItems(mapped);
          const pg = res.meta?.pagination || { page: 1, pageCount: 1 };
          setHasMore(pg.page < pg.pageCount);
        } else {
          // Fallback to mock
          setItems(mock);
          setHasMore(false);
        }
      } catch (_) {
        setItems(mock);
        setHasMore(false);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (items.length === 0) {
      load(1);
    }
    return () => { mounted = false; };
  }, []); // eslint-disable-line

  const loadMore = () => {
    if (loading || !hasMore) return;
    // If CMS connected, you'd call fetchNews for next page. For now, we simply stop or extend mock.
    setLoading(true);
    setTimeout(() => {
      const extra = mock.map(n => ({ ...n, id: n.id + page * 100, title: n.title + ' (Ext)' }));
      setItems(prev => [...prev, ...extra]);
      setPage(p => p + 1);
      if (page >= 2) setHasMore(false);
      setLoading(false);
    }, 600);
  };

  const renderItem = (n) => (
    <article className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
        <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <span className="flex items-center"><i className="fas fa-newspaper mr-1 text-blue-500"></i>{n.source}</span>
      </div>
  <Link to={`/news/${n.slug}`} className="text-lg font-semibold mb-2 text-gray-900 leading-snug hover:text-blue-600 block">{n.title}</Link>
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{n.content}</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {n.tags.map(t => <span key={t} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">#{t}</span>)}
      </div>
  <Link to={`/news/${n.slug}`} className="text-blue-600 text-sm font-medium hover:underline">Read More →</Link>
    </article>
  );

  return (
    <PageLayout
      title={siteContent.pages?.news?.title}
      description={siteContent.pages?.news?.description}
      seo={siteContent.pages?.news?.seo}
    >
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'News' }]} className="mb-6" />
          <MasonryLayout
            items={items}
            renderItem={renderItem}
            columns={3}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={loadMore}
          />
        </div>
      </section>
    </PageLayout>
  );
};

export default NewsPage;