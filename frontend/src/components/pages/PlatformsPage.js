import React, { useState, useEffect } from 'react';
import PageLayout from '../layout/PageLayout';
import Breadcrumbs from '../ui/Breadcrumbs';
import { Link } from 'react-router-dom';
import MasonryLayout from '../ui/MasonryLayout';
import siteContent from '../../config/siteContent';

const PlatformsPage = () => {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // 增加可选 logo 字段
  const data = [
    { id: 1, slug: 'binance', name: 'Binance', score: 9.8, business: 'Global Exchange', summary: 'Largest by volume with wide derivatives products.', pairs: 1400, volume: '$15.2B', established: 2017, logo: 'https://via.placeholder.com/64x64/f3b322/ffffff?text=BN' },
    { id: 2, slug: 'coinbase-pro', name: 'Coinbase Pro', score: 9.5, business: 'Regulated Exchange', summary: 'US regulated, strong compliance & custody.', pairs: 250, volume: '$2.8B', established: 2012, logo: 'https://via.placeholder.com/64x64/0052ff/ffffff?text=CB' },
    { id: 3, slug: 'kraken', name: 'Kraken', score: 9.3, business: 'Professional Exchange', summary: 'Advanced features & security reputation.', pairs: 400, volume: '$1.2B', established: 2011, logo: 'https://via.placeholder.com/64x64/5741d9/ffffff?text=KR' },
    { id: 4, slug: 'huobi', name: 'Huobi', score: 8.7, business: 'Global Digital Asset', summary: 'Wide altcoin support & derivatives.', pairs: 600, volume: '$800M', established: 2013 },
    { id: 5, slug: 'kucoin', name: 'KuCoin', score: 8.4, business: 'Altcoin Exchange', summary: 'Known for emerging token listings.', pairs: 700, volume: '$600M', established: 2017 }
  ];

  useEffect(() => {
    if (platforms.length === 0) {
      setLoading(true);
      setTimeout(() => { setPlatforms(data); setLoading(false); }, 400);
    }
  }, []); // eslint-disable-line

  const loadMore = () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      const extra = data.slice(0,3).map(p => ({ ...p, id: p.id + page * 100, name: p.name + ' X' }));
      setPlatforms(prev => [...prev, ...extra]);
      setPage(p => p + 1);
      if (page >= 2) setHasMore(false);
      setLoading(false);
    }, 600);
  };

  const scoreClass = (s) => s >= 9 ? 'text-green-600' : s >= 8 ? 'text-yellow-600' : 'text-gray-600';

  // 渲染Logo（含占位与错误回退）
  const Logo = ({ src, alt }) => {
    const [error, setError] = useState(false);
    const placeholder = (
      <div className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 text-xs select-none">
        LOGO
      </div>
    );
    if (!src || error) return placeholder;
    return (
      <img
        src={src}
        alt={alt}
        className="w-14 h-14 rounded-lg bg-white object-contain border border-gray-200 shadow-sm"
        onError={() => setError(true)}
        loading="lazy"
      />
    );
  };

  const renderPlatform = (p) => (
    <article className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* 头部：左侧名称+logo，右侧评分 */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <Link to={`/platforms/${p.slug}`} className="text-lg font-semibold text-gray-900 hover:text-blue-600">
            {p.name}
          </Link>
          <div className="mt-2">
            <Logo src={p.logo} alt={`${p.name} logo`} />
          </div>
        </div>
        <span className={`text-lg font-bold ${scoreClass(p.score)}`}>{p.score}</span>
      </div>

      <p className="text-sm text-gray-600 mb-2">{p.business} • Since {p.established}</p>
      <p className="text-gray-700 text-sm mb-4 leading-relaxed">{p.summary}</p>

      <div className="grid grid-cols-3 gap-3 text-center text-xs mb-4">
        <div className="bg-gray-50 rounded p-2">
          <div className="font-semibold text-gray-900">{p.pairs}</div>
          <div className="text-gray-500">Pairs</div>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <div className="font-semibold text-gray-900">{p.volume}</div>
          <div className="text-gray-500">Volume</div>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <div className="font-semibold text-gray-900">{p.established}</div>
          <div className="text-gray-500">Year</div>
        </div>
      </div>

      <div className="flex justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <span><i className="fas fa-shield-alt text-blue-500 mr-1"></i>Verified</span>
        <Link to={`/platforms/${p.slug}`} className="text-blue-600 hover:underline font-medium">Details →</Link>
      </div>
    </article>
  );

  return (
    <PageLayout
      title={siteContent.pages?.platforms?.title}
      description={siteContent.pages?.platforms?.description}
      seo={siteContent.pages?.platforms?.seo}
    >
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Platforms' }]} className="mb-6" />
          <MasonryLayout
            items={platforms}
            renderItem={renderPlatform}
            columns={2}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={loadMore}
          />
        </div>
      </section>
    </PageLayout>
  );
};

export default PlatformsPage;