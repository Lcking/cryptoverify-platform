import React, { useState, useEffect } from 'react';
import PageLayout from '../layout/PageLayout';
import MasonryLayout from '../ui/MasonryLayout';

const NewsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const mock = Array.from({ length: 6 }).map((_, i) => ({
    id: i + 1,
    title: `Market Update #${i + 1}`,
    content: 'Concise crypto market update summary describing key movements and sentiment shifts across major assets.',
    source: 'CryptoWire',
    timestamp: new Date(Date.now() - i * 3600 * 1000).toISOString(),
    tags: ['Bitcoin', 'Volatility', 'Macro']
  }));

  useEffect(() => {
    if (items.length === 0) {
      setLoading(true);
      setTimeout(() => { setItems(mock); setLoading(false); }, 400);
    }
  }, []); // eslint-disable-line

  const loadMore = () => {
    if (loading) return;
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
      <h2 className="text-lg font-semibold mb-2 text-gray-900 leading-snug">{n.title}</h2>
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{n.content}</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {n.tags.map(t => <span key={t} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">#{t}</span>)}
      </div>
      <button className="text-blue-600 text-sm font-medium hover:underline">Read More →</button>
    </article>
  );

  return (
    <PageLayout title="24/7 Live Crypto News" description="Real-time market intelligence and concise crypto asset developments.">
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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