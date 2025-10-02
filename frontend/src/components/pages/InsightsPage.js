import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../layout/PageLayout';
import Breadcrumbs from '../ui/Breadcrumbs';
import MasonryLayout from '../ui/MasonryLayout';
import { insights as mockInsights } from '../../data/mock';
import siteContent from '../../config/siteContent';
import { ENABLE_CMS } from '../../config/cms';
import { fetchInsights } from '../../lib/cmsClient';

const InsightsPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const badge = (c) => {
    const map = { Technology: 'bg-purple-100 text-purple-700', Market: 'bg-blue-100 text-blue-700', Security: 'bg-red-100 text-red-700', Economy: 'bg-green-100 text-green-700', Trading: 'bg-indigo-100 text-indigo-700' };
    return map[c] || 'bg-gray-100 text-gray-700';
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        if (ENABLE_CMS) {
          const res = await fetchInsights({ page: 1, pageSize: 30 });
          const list = res?.data || [];
          if (!cancelled) {
            setArticles(list);
            setHasMore((res?.meta?.pagination?.page || 1) < (res?.meta?.pagination?.pageCount || 1));
          }
        } else {
          if (!cancelled) {
            setArticles(mockInsights);
            setHasMore(false);
          }
        }
      } catch (_) {
        if (!cancelled) {
          setArticles(mockInsights);
          setHasMore(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const renderArticle = (a) => (
    <Link to={`/insights/${a.slug}`} className="block bg-white rounded-xl shadow p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-3 text-xs">
        <span className={`px-2 py-1 rounded-full font-medium ${badge(a.category)}`}>{a.category}</span>
        <span className="text-gray-500 flex items-center"><i className="far fa-clock mr-1"></i>{a.read}</span>
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2 leading-snug">{a.title}</h2>
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{a.excerpt}</p>
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <span className="flex items-center"><i className="fas fa-user-edit text-blue-500 mr-1"></i>{a.author}</span>
        <span className="text-blue-600 hover:underline font-medium">Read Insight →</span>
      </div>
    </Link>
  );

  return (
    <PageLayout
      title={siteContent.pages?.insights?.title}
      description={siteContent.pages?.insights?.description}
      seo={siteContent.pages?.insights?.seo}
    >
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            className="mb-6"
            items={[
              { label: 'Home', to: '/' },
              { label: 'Insights', to: '/insights' }
            ]}
          />
          <MasonryLayout
            items={articles}
            renderItem={renderArticle}
            columns={3}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={() => {}}
          />
        </div>
      </section>
    </PageLayout>
  );
};

export default InsightsPage;