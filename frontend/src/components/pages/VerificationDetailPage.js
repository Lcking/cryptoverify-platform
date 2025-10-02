import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageLayout from '../layout/PageLayout';
import Breadcrumbs from '../ui/Breadcrumbs';
import { ENABLE_CMS } from '../../config/cms';
import { fetchVerificationBySlug } from '../../lib/cmsClient';

const VerificationDetailPage = () => {
  const { slug } = useParams();
  const [v, setV] = useState(null);
  const [platform, setPlatform] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (ENABLE_CMS) {
          const entity = await fetchVerificationBySlug(slug);
          if (!cancelled) setV(entity);
          // 若后端返回了 relation，则直接用 relation 中的平台名称/slug
          if (entity?.platformSlug || entity?.platformName) {
            setPlatform({ slug: entity.platformSlug, name: entity.platformName || entity.platformSlug });
          }
          return;
        }
      } catch (_) {}
      // fallback to mock
      const m = null; // not used now
      setV(m);
      setPlatform(null);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (!v) {
    return (
      <PageLayout title="Verification Not Found" description="The verification record you are looking for does not exist.">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-600 mb-6">We couldn't find the verification "{slug}".</p>
          <Link to="/verifications" className="text-blue-600 hover:underline">Back to Verifications</Link>
        </div>
      </PageLayout>
    );
  }
  return (
    <PageLayout title={v.title} description={platform ? platform.name : 'Verification record'}>
      <article className="py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Verifications', to: '/verifications' }, { label: v.title }]} className="mb-4" />
          <div className="text-sm text-gray-500 mb-4 flex items-center justify-between">
            {platform ? (
              <Link to={`/platforms/${platform.slug}`} className="text-blue-600 hover:underline">{platform.name}</Link>
            ) : <span>Unknown Platform</span>}
            <time>{new Date(v.publishedAt).toLocaleString()}</time>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-snug">{v.title}</h1>
          {v.content ? (
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: v.content }} />
          ) : (
            <p className="text-gray-700">No content.</p>
          )}
          <div className="mt-8 flex items-center gap-6">
            <Link to="/verifications" className="text-blue-600 hover:underline">← Back to Verifications</Link>
            {platform && <Link to={`/platforms/${platform.slug}`} className="text-blue-600 hover:underline">View Platform →</Link>}
          </div>
        </div>
      </article>
    </PageLayout>
  );
};

export default VerificationDetailPage;
