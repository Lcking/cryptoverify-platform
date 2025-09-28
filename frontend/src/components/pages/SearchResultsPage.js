import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PageLayout from '../layout/PageLayout';
import Breadcrumbs from '../ui/Breadcrumbs';
import { platforms, news, insights, exposureReports, verifications } from '../../data/mock';
import { searchAll } from '../../api/searchClient';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const normalize = (s) => (s || '').toLowerCase();

const SearchResultsPage = () => {
  const params = useQuery();
  const rawQ = params.get('q') || '';
  const q = normalize(rawQ);

  const doMatch = (text) => q && normalize(text).includes(q);

  const [loading, setLoading] = useState(false);
  const [serverData, setServerData] = useState(null); // { platforms, news, insights, exposure, verifications }
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!q) { setServerData(null); setError(null); return; }
      setLoading(true);
      const res = await searchAll(rawQ);
      if (!mounted) return;
      if (res.ok) {
        setServerData(res.data);
        setError(null);
      } else {
        setServerData(null);
        setError(res.error || 'Search failed');
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [q, rawQ]);

  // Fallback to local mock if server search not available
  const platformHits = serverData?.platforms ?? (q ? platforms.filter(p => doMatch(p.name) || doMatch(p.slug)) : []);
  const newsHits = serverData?.news ?? (q ? news.filter(n => doMatch(n.title) || doMatch(n.content) || doMatch(n.source)) : []);
  const insightsHits = serverData?.insights ?? (q ? insights.filter(i => doMatch(i.title) || doMatch(i.excerpt) || doMatch(i.author)) : []);
  const exposureHits = serverData?.exposure ?? (q ? exposureReports.filter(r => doMatch(r.platform) || doMatch(r.type) || doMatch(r.summary)) : []);
  const verificationHits = serverData?.verifications ?? (q ? verifications.filter(v => doMatch(v.title) || doMatch(v.platformSlug)) : []);

  const total = platformHits.length + newsHits.length + insightsHits.length + exposureHits.length + verificationHits.length;

  const title = 'Search Results';
  const description = q ? `Results for "${rawQ}"` : 'Type a keyword to search across the site.';

  return (
    <PageLayout title={title} description={description}>
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4">
          <Breadcrumbs
            className="mb-4"
            items={[
              { label: 'Home', to: '/' },
              { label: 'Search', to: '/search' }
            ]}
          />
          {!q && (
            <div className="text-gray-600">Try searching platform names, news titles, or exposure types.</div>
          )}

          {q && loading && (
            <div className="text-sm text-gray-500 mb-6">Searching…</div>
          )}

          {q && !loading && error && (
            <div className="text-sm text-red-600 mb-6">{error} — showing local matches</div>
          )}

          {q && !loading && (
            <div className="text-sm text-gray-600 mb-6">{total} results</div>
          )}

          {q && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Platforms */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Platforms ({platformHits.length})</h3>
                {platformHits.length === 0 ? (
                  <div className="text-gray-500 text-sm">No matches</div>
                ) : (
                  <ul className="space-y-2">
                    {platformHits.map(p => (
                      <li key={p.slug} className="p-3 bg-white rounded-lg border hover:shadow-sm transition">
                        <Link to={`/platforms/${p.slug}`} className="text-blue-600 hover:underline font-medium">{p.name}</Link>
                        <div className="text-xs text-gray-500 mt-1">Trust: {p.score ?? '—'} • {p.verified ? 'Verified' : 'Unverified'}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* News */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">News ({newsHits.length})</h3>
                {newsHits.length === 0 ? (
                  <div className="text-gray-500 text-sm">No matches</div>
                ) : (
                  <ul className="space-y-2">
                    {newsHits.map(n => (
                      <li key={n.slug} className="p-3 bg-white rounded-lg border hover:shadow-sm transition">
                        <Link to={`/news/${n.slug}`} className="text-blue-600 hover:underline font-medium">{n.title}</Link>
                        <div className="text-xs text-gray-500 mt-1">{new Date(n.timestamp).toLocaleString()}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Insights */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Insights ({insightsHits.length})</h3>
                {insightsHits.length === 0 ? (
                  <div className="text-gray-500 text-sm">No matches</div>
                ) : (
                  <ul className="space-y-2">
                    {insightsHits.map(i => (
                      <li key={i.slug} className="p-3 bg-white rounded-lg border hover:shadow-sm transition">
                        <Link to={`/insights/${i.slug}`} className="text-blue-600 hover:underline font-medium">{i.title}</Link>
                        <div className="text-xs text-gray-500 mt-1">{i.author} • {new Date(i.timestamp).toLocaleString()}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Exposure */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Exposure ({exposureHits.length})</h3>
                {exposureHits.length === 0 ? (
                  <div className="text-gray-500 text-sm">No matches</div>
                ) : (
                  <ul className="space-y-2">
                    {exposureHits.map(r => (
                      <li key={r.slug} className="p-3 bg-white rounded-lg border hover:shadow-sm transition">
                        <Link to={`/exposure/${r.slug}`} className="text-blue-600 hover:underline font-medium">{r.platform} — {r.type}</Link>
                        <div className="text-xs text-gray-500 mt-1">Severity: {r.severity} • {new Date(r.reportedDate).toLocaleString()}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Verifications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Verifications ({verificationHits.length})</h3>
                {verificationHits.length === 0 ? (
                  <div className="text-gray-500 text-sm">No matches</div>
                ) : (
                  <ul className="space-y-2">
                    {verificationHits.map(v => (
                      <li key={v.slug} className="p-3 bg-white rounded-lg border hover:shadow-sm transition">
                        <Link to={`/verifications/${v.slug}`} className="text-blue-600 hover:underline font-medium">{v.title}</Link>
                        <div className="text-xs text-gray-500 mt-1">{new Date(v.publishedAt).toLocaleDateString()}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default SearchResultsPage;
