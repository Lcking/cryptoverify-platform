import React, { useState, useEffect } from 'react';
import PageLayout from '../layout/PageLayout';
import MasonryLayout from '../ui/MasonryLayout';

const InsightsPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const base = [
    { id: 1, title: 'Layer 2 Scaling Outlook', excerpt: 'How rollups and zk proofs shape Ethereum performance trajectory in 2024.', author: 'Research Desk', category: 'Technology', read: '7 min' },
    { id: 2, title: 'Institutional Adoption Curve', excerpt: 'Tracking custody growth and ETF flows as institutional rails mature.', author: 'Market Analytics', category: 'Market', read: '6 min' },
    { id: 3, title: 'Security Incidents Review', excerpt: 'Key exploit patterns and mitigation posture observed across Q1.', author: 'Security Lab', category: 'Security', read: '8 min' },
    { id: 4, title: 'Stablecoin Liquidity Map', excerpt: 'Comparative analysis of USD liquidity fragmentation across chains.', author: 'Macro Team', category: 'Economy', read: '5 min' },
    { id: 5, title: 'DEX vs CEX Volume Trend', excerpt: 'Decentralized spot share signals structural evolution in trading.', author: 'Analytics', category: 'Trading', read: '9 min' }
  ];

  useEffect(() => {
    if (articles.length === 0) {
      setLoading(true);
      setTimeout(() => { setArticles(base); setLoading(false); }, 400);
    }
  }, []); // eslint-disable-line

  const loadMore = () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      const extra = base.slice(0,3).map(a => ({ ...a, id: a.id + page * 100, title: a.title + ' Update' }));
      setArticles(prev => [...prev, ...extra]);
      setPage(p => p + 1);
      if (page >= 2) setHasMore(false);
      setLoading(false);
    }, 600);
  };

  const badge = (c) => {
    const map = { Technology: 'bg-purple-100 text-purple-700', Market: 'bg-blue-100 text-blue-700', Security: 'bg-red-100 text-red-700', Economy: 'bg-green-100 text-green-700', Trading: 'bg-indigo-100 text-indigo-700' };
    return map[c] || 'bg-gray-100 text-gray-700';
  };

  const renderArticle = (a) => (
    <article className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-3 text-xs">
        <span className={`px-2 py-1 rounded-full font-medium ${badge(a.category)}`}>{a.category}</span>
        <span className="text-gray-500 flex items-center"><i className="far fa-clock mr-1"></i>{a.read}</span>
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2 leading-snug">{a.title}</h2>
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{a.excerpt}</p>
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <span className="flex items-center"><i className="fas fa-user-edit text-blue-500 mr-1"></i>{a.author}</span>
        <button className="text-blue-600 hover:underline font-medium">Read Insight →</button>
      </div>
    </article>
  );

  return (
    <PageLayout title="Market Insights & Research" description="Analytical perspectives, structural metrics, and forward-looking crypto market intelligence.">
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MasonryLayout
            items={articles}
            renderItem={renderArticle}
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

export default InsightsPage;