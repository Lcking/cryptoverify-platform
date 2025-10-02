import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageLayout from '../layout/PageLayout';
import Breadcrumbs from '../ui/Breadcrumbs';
import { news as newsMock } from '../../data/mock';
import { fetchNewsBySlug } from '../../lib/cmsClient';

const NewsDetailPage = () => {
  const { slug } = useParams();
  const [n, setN] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchNewsBySlug(slug);
        if (!mounted) return;
        if (data) {
          const item = {
            id: data.id,
            slug: data.attributes?.slug,
            title: data.attributes?.title,
            content: data.attributes?.content || data.attributes?.excerpt || '',
            source: data.attributes?.source || 'News',
            timestamp: data.attributes?.timestamp || data.attributes?.publishedAt || new Date().toISOString(),
            tags: data.attributes?.tags || []
          };
          setN(item);
        } else {
          setN(newsMock.find(x => x.slug === slug) || null);
        }
      } catch (_) {
        setN(newsMock.find(x => x.slug === slug) || null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [slug]);

  if (!loading && !n) {
    return (
      <PageLayout title="Article Not Found" description="The news you are looking for does not exist.">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-600 mb-6">We couldn't find the article "{slug}".</p>
          <Link to="/news" className="text-blue-600 hover:underline">Back to News</Link>
        </div>
      </PageLayout>
    );
  }

  const title = n?.title || 'Loading…';
  const desc = n?.content ? n.content.substring(0, 150) : 'Loading news…';

  return (
    <PageLayout title={title} description={desc}>
      <article className="py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'News', to: '/news' }, { label: n?.title || 'Loading' }]} className="mb-4" />
          {!n ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : (
            <>
              <div className="text-sm text-gray-500 mb-4 flex items-center justify-between">
                <span className="flex items-center"><i className="fas fa-newspaper mr-1 text-blue-500"></i>{n.source}</span>
                <time>{new Date(n.timestamp).toLocaleString()}</time>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-snug">{n.title}</h1>
              <div className="flex flex-wrap gap-2 mb-6">
                {n.tags.map(t => <span key={t} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">#{t}</span>)}
              </div>
              <p className="text-gray-800 leading-8">{n.content} This is a longer body placeholder for the detail page to simulate a real article content.</p>
            </>
          )}
          <div className="mt-8">
            <Link to="/news" className="text-blue-600 hover:underline">← Back to News</Link>
          </div>
        </div>
      </article>
    </PageLayout>
  );
};

export default NewsDetailPage;
