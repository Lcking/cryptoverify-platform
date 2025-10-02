import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageLayout from '../layout/PageLayout';
import Breadcrumbs from '../ui/Breadcrumbs';
import { insights as mockInsights } from '../../data/mock';
import { ENABLE_CMS } from '../../config/cms';
import { fetchInsightBySlug } from '../../lib/cmsClient';

const InsightsDetailPage = () => {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        if (ENABLE_CMS) {
          const data = await fetchInsightBySlug(slug);
          if (!cancelled) setItem(data || null);
          setLoading(false);
          return;
        }
      } catch (_) {}
      if (!cancelled) {
        setItem(mockInsights.find((n) => n.slug === slug) || null);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <PageLayout title="Loading Insight..." description="Loading insight content">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <p className="text-slate-500">Loading...</p>
        </div>
      </PageLayout>
    );
  }

  if (!item) {
    return (
      <PageLayout title="Insight Not Found" description="We couldn't find the requested insight.">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <p className="text-slate-500">It may have been moved or removed.</p>
          <div className="mt-6">
            <Link className="text-blue-600 hover:underline" to="/insights">Back to Insights</Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={item.title} description={item.excerpt}>
      <article className="max-w-3xl mx-auto px-4 py-10">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Insights', to: '/insights' }, { label: item.title }]} className="mb-4" />
        <Link to="/insights" className="text-blue-600 hover:underline">← Back to Insights</Link>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">{item.title}</h1>
        <div className="mt-2 text-sm text-slate-500">
          <span>{new Date(item.timestamp).toLocaleString()}</span>
          <span className="mx-2">•</span>
          <span>{item.author}</span>
          <span className="mx-2">•</span>
          <span>{item.read} read</span>
        </div>
        <div className="mt-6 prose max-w-none" dangerouslySetInnerHTML={{ __html: item.content || `<p>${item.excerpt || ''}</p>` }} />
      </article>
    </PageLayout>
  );
};

export default InsightsDetailPage;
