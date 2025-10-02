import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageLayout from '../layout/PageLayout';
import VerifiedBadge from '../verification/VerifiedBadge';
import VerificationListModal from '../verification/VerificationListModal';
import Breadcrumbs from '../ui/Breadcrumbs';
import { ENABLE_CMS } from '../../config/cms';
import { fetchPlatformBySlug, fetchVerifications } from '../../lib/cmsClient';
const CMS_ADMIN_URL = process.env.REACT_APP_CMS_ADMIN_URL || '';

const PlatformDetailPage = () => {
  const { slug } = useParams();
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [platformVerifications, setPlatformVerifications] = useState([]);
  const [vPage, setVPage] = useState(1);
  const [vPageCount, setVPageCount] = useState(1);
  const [vLoading, setVLoading] = useState(false);
  const latest = platformVerifications[0];

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        if (ENABLE_CMS) {
          const entity = await fetchPlatformBySlug(slug);
          if (!cancelled) setP(entity);
          // 拉取该平台的 verifications
          const vres = await fetchVerifications({ page: 1, pageSize: 10, sort: 'publishedAt:desc', platformSlug: slug });
          const list = (vres?.data || []);
          if (!cancelled) {
            setPlatformVerifications(list);
            const meta = vres?.meta?.pagination || { page: 1, pageCount: 1 };
            setVPage(meta.page || 1);
            setVPageCount(meta.pageCount || 1);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [slug]);

  const loadMoreVerifications = async () => {
    if (!ENABLE_CMS) return;
    if (vLoading) return;
    if (vPage >= vPageCount) return;
    setVLoading(true);
    try {
      const nextPage = vPage + 1;
      const vres = await fetchVerifications({ page: nextPage, pageSize: 10, sort: 'publishedAt:desc', platformSlug: slug });
      const list = (vres?.data || []);
      setPlatformVerifications(prev => [...prev, ...list]);
      const meta = vres?.meta?.pagination || { page: nextPage, pageCount: vPageCount };
      setVPage(meta.page || nextPage);
      setVPageCount(meta.pageCount || vPageCount);
    } finally {
      setVLoading(false);
    }
  };

  if (!p && !loading) {
    return (
      <PageLayout title="Platform Not Found" description="The platform you are looking for does not exist.">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-600 mb-6">We couldn't find the platform "{slug}".</p>
          <Link to="/platforms" className="text-blue-600 hover:underline">Back to Platforms</Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={p?.name || 'Platform'} description={p?.summary || 'Exchange platform profile and metrics.'}>
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Platforms', to: '/platforms' }, { label: p?.name || '...' }]} className="mb-4" />
          <div className="bg-white rounded-2xl shadow p-6 md:p-10">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-center gap-4">
                {p?.logo ? (
                  <img src={p.logo} alt={`${p.name} logo`} className="w-16 h-16 rounded-lg object-contain border" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 text-xs">LOGO</div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{p?.name || '...'}</h1>
                  <p className="text-gray-600">{p?.business} • Since {p?.established}</p>
                </div>
              </div>
              <div className="text-right space-y-2">
                <div>
                  <div className="text-sm text-gray-500">Score</div>
                  <div className="text-2xl font-extrabold text-green-600">{p?.score ?? '-'}</div>
                </div>
                <VerifiedBadge verified={true} count={platformVerifications.length} onClick={() => setOpen(true)} />
              </div>
            </div>

            <hr className="my-6" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded p-4 text-center">
                <div className="text-gray-500 text-xs">Pairs</div>
                <div className="text-lg font-semibold">{p?.pairs ?? '-'}</div>
              </div>
              <div className="bg-gray-50 rounded p-4 text-center">
                <div className="text-gray-500 text-xs">Volume</div>
                <div className="text-lg font-semibold">{p?.volume || '-'}</div>
              </div>
              <div className="bg-gray-50 rounded p-4 text-center">
                <div className="text-gray-500 text-xs">Established</div>
                <div className="text-lg font-semibold">{p?.established ?? '-'}</div>
              </div>
              <div className="bg-gray-50 rounded p-4 text-center">
                <div className="text-gray-500 text-xs">Status</div>
                <div className="text-lg font-semibold">Verified</div>
              </div>
            </div>

            {/* 内容区：富文本 HTML 渲染（content/descriptionHtml 优先） */}
            {p?.content ? (
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: p.content }} />
            ) : (
              <p className="text-gray-700 leading-relaxed">{p?.summary}</p>
            )}

            {/* Latest verification card */}
            <div className="mt-8">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Latest verification</h2>
              {latest ? (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <Link to={`/verifications/${latest.slug}`} className="text-blue-700 font-medium hover:underline">
                      {latest.title}
                    </Link>
                    <div className="text-xs text-gray-500 mt-1">{new Date(latest.publishedAt).toLocaleString()}</div>
                  </div>
                  <Link to={`/verifications/${latest.slug}`} className="text-blue-600 hover:underline text-sm">View →</Link>
                </div>
              ) : (
                <div className="text-sm text-gray-500">No verification records yet.</div>
              )}
            </div>

            <div className="mt-8">
              <Link to="/platforms" className="text-blue-600 hover:underline">← Back to Platforms</Link>
              {CMS_ADMIN_URL && (
                <a
                  href={`${CMS_ADMIN_URL}/content-manager/collection-types/api::verification.verification/create`}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-4 inline-flex items-center px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm"
                  title="Open Strapi Admin to create a new verification"
                >
                  + Add Verification
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <VerificationListModal
        open={open}
        onClose={() => setOpen(false)}
        items={platformVerifications}
        loading={vLoading}
        hasMore={vPage < vPageCount}
        onLoadMore={loadMoreVerifications}
        title="Verification Records"
      />
    </PageLayout>
  );
};

export default PlatformDetailPage;
