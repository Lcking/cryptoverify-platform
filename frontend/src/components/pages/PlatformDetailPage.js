import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageLayout from '../layout/PageLayout';
import { platforms, verifications } from '../../data/mock';
import VerifiedBadge from '../verification/VerifiedBadge';
import VerificationListModal from '../verification/VerificationListModal';
import Breadcrumbs from '../ui/Breadcrumbs';

const PlatformDetailPage = () => {
  const { slug } = useParams();
  const p = platforms.find(x => x.slug === slug);
  const [open, setOpen] = useState(false);
  const platformVerifications = useMemo(
    () => verifications.filter(v => v.platformSlug === slug).sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt)),
    [slug]
  );
  const latest = platformVerifications[0];

  if (!p) {
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
    <PageLayout title={p.name} description={p.summary || 'Exchange platform profile and metrics.'}>
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Platforms', to: '/platforms' }, { label: p.name }]} className="mb-4" />
          <div className="bg-white rounded-2xl shadow p-6 md:p-10">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-center gap-4">
                {p.logo ? (
                  <img src={p.logo} alt={`${p.name} logo`} className="w-16 h-16 rounded-lg object-contain border" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 text-xs">LOGO</div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{p.name}</h1>
                  <p className="text-gray-600">{p.business} • Since {p.established}</p>
                </div>
              </div>
              <div className="text-right space-y-2">
                <div>
                  <div className="text-sm text-gray-500">Score</div>
                  <div className="text-2xl font-extrabold text-green-600">{p.score}</div>
                </div>
                <VerifiedBadge verified={!!p.verified} count={p.verificationCount} onClick={() => setOpen(true)} />
              </div>
            </div>

            <hr className="my-6" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded p-4 text-center">
                <div className="text-gray-500 text-xs">Pairs</div>
                <div className="text-lg font-semibold">{p.pairs}</div>
              </div>
              <div className="bg-gray-50 rounded p-4 text-center">
                <div className="text-gray-500 text-xs">Volume</div>
                <div className="text-lg font-semibold">{p.volume}</div>
              </div>
              <div className="bg-gray-50 rounded p-4 text-center">
                <div className="text-gray-500 text-xs">Established</div>
                <div className="text-lg font-semibold">{p.established}</div>
              </div>
              <div className="bg-gray-50 rounded p-4 text-center">
                <div className="text-gray-500 text-xs">Status</div>
                <div className="text-lg font-semibold">Verified</div>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed">{p.summary}</p>

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
            </div>
          </div>
        </div>
      </section>

      <VerificationListModal
        open={open}
        onClose={() => setOpen(false)}
        items={platformVerifications}
        title="Verification Records"
      />
    </PageLayout>
  );
};

export default PlatformDetailPage;
