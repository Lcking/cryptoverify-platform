import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../layout/PageLayout';
import Breadcrumbs from '../ui/Breadcrumbs';
import MasonryLayout from '../ui/MasonryLayout';
import { exposureReports as exposureMock } from '../../data/mock';
import { ENABLE_CMS } from '../../config/cms';
import { fetchExposures } from '../../lib/cmsClient';
import siteContent from '../../config/siteContent';

/**
 * ExposurePage
 * Showcases reported fraudulent / risky platforms with verification evidence.
 * SEO Consideration: First batch rendered immediately (no skeleton placeholders),
 * subsequent batches lazy-loaded on scroll to preserve crawlable HTML.
 */
const ExposurePage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const mockExposureData = exposureMock;

  // Initial load
  useEffect(() => {
    loadInitialReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [severityFilter, typeFilter]);

  const loadInitialReports = async () => {
    setLoading(true);
    try {
      if (ENABLE_CMS) {
        const res = await fetchExposures({ page: 1, pageSize: 20 });
        if (res?.data?.length) {
          const items = res.data;
          let data = items;
          if (severityFilter !== 'all') data = data.filter(r => (r.severity || '').toLowerCase() === severityFilter);
          if (typeFilter !== 'all') data = data.filter(r => (r.type || '').toLowerCase().includes(typeFilter));
          const sevRank = { critical: 4, high: 3, medium: 2, low: 1 };
          data.sort((a,b) => {
            const s = (sevRank[(b.severity||'').toLowerCase()] || 0) - (sevRank[(a.severity||'').toLowerCase()] || 0);
            if (s !== 0) return s;
            return new Date(b.reportedDate || 0) - new Date(a.reportedDate || 0);
          });
          setReports(data);
          setPage(1);
          setHasMore((res.meta?.pagination?.page || 1) < (res.meta?.pagination?.pageCount || 1));
          setLoading(false);
          return;
        }
      }
    } catch (_) {}
    // fallback mock
    setTimeout(() => {
      let data = [...mockExposureData];
      if (severityFilter !== 'all') {
        data = data.filter(r => r.severity.toLowerCase() === severityFilter);
      }
      if (typeFilter !== 'all') {
        data = data.filter(r => r.type.toLowerCase().includes(typeFilter));
      }
      const sevRank = { critical: 4, high: 3, medium: 2, low: 1 };
      data.sort((a,b) => {
        const s = sevRank[b.severity.toLowerCase()] - sevRank[a.severity.toLowerCase()];
        if (s !== 0) return s;
        return new Date(b.reportedDate) - new Date(a.reportedDate);
      });
      setReports(data);
      setPage(1);
      setHasMore(true);
      setLoading(false);
    }, 300);
  };

  const loadMoreReports = async () => {
    if (loading) return;
    if (ENABLE_CMS) {
      setLoading(true);
      try {
        const next = page + 1;
  const res = await fetchExposures({ page: next, pageSize: 20 });
  const items = res?.data || [];
        setReports(prev => [...prev, ...items]);
        setPage(next);
        setHasMore((res?.meta?.pagination?.page || next) < (res?.meta?.pagination?.pageCount || next));
        setLoading(false);
        return;
      } catch (_) {
        // fall through to mock
      }
      setLoading(false);
    }
    // mock pagination
    setLoading(true);
    setTimeout(() => {
      const more = mockExposureData.slice(0,3).map(r => ({
        ...r,
        id: r.id + page * 100,
        reportedDate: new Date(Date.now() - Math.random()*72*3600*1000).toISOString(),
        lastUpdate: new Date().toISOString(),
        reporterCount: r.reporterCount + Math.floor(Math.random()*5)
      }));
      setReports(prev => [...prev, ...more]);
      setPage(p => p + 1);
      if (page >= 2) setHasMore(false);
      setLoading(false);
    }, 500);
  };

  const formatTime = (iso) => new Date(iso).toLocaleString(undefined, { hour12: false });

  const severityBadgeClass = (sev) => {
    switch (sev) {
      case 'Critical': return 'bg-red-100 text-red-700';
      case 'High': return 'bg-orange-100 text-orange-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const statusColor = (status) => {
    if (/confirmed/i.test(status)) return 'text-red-600';
    if (/warning/i.test(status)) return 'text-orange-600';
    if (/investigating/i.test(status)) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const renderReport = (r) => (
    <Link to={`/exposure/${r.slug}`} className={`block bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border-l-4 ${
      r.severity === 'Critical' ? 'border-red-500' : r.severity === 'High' ? 'border-orange-500' : 'border-yellow-400'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">{r.platform}</h2>
          <div className="flex items-center flex-wrap gap-2">
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${severityBadgeClass(r.severity)}`}>{r.severity}</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{r.type}</span>
            <span className={`text-xs font-medium ${statusColor(r.status)}`}>{r.status}</span>
          </div>
        </div>
        <div className="text-right text-xs text-gray-500">
          <div>Reported: {formatTime(r.reportedDate)}</div>
          <div>Updated: {formatTime(r.lastUpdate)}</div>
        </div>
      </div>

      <p className="text-gray-700 leading-relaxed mb-4">
        {r.summary}
      </p>

      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
          <i className="fas fa-file-circle-check text-blue-500 mr-2"></i> Evidence
        </h3>
        <ul className="space-y-1 list-disc list-inside text-sm text-gray-600">
          {r.evidence.map((e,i) => <li key={i}>{e}</li>)}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {r.riskFactors.map((rf,i) => (
          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">#{rf}</span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-600">
        <span className="flex items-center"><i className="fas fa-user-shield mr-1 text-blue-500"></i>{r.reporterCount} reporters</span>
        <span className="text-blue-600 hover:text-blue-700 font-medium">View Details →</span>
      </div>
    </Link>
  );

  const pageTitle = siteContent.pages?.exposure?.title || 'Fraud Exposure & Risk Alerts';
  const pageDescription = siteContent.pages?.exposure?.description || 'Verified community and analytic reports exposing fraudulent or high-risk online platforms with evidence.';

  return (
    <PageLayout title={pageTitle} description={pageDescription} seo={siteContent.pages?.exposure?.seo}>
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Exposure' }]} className="mb-4" />
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Severity:</span>
                <select value={severityFilter} onChange={e=>setSeverityFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="all">All</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Type:</span>
                <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="all">All</option>
                  <option value="fake">Fake License</option>
                  <option value="ponzi">Ponzi</option>
                  <option value="exit">Exit Scam</option>
                  <option value="data">Data Manipulation</option>
                  <option value="locked">Locked Funds</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-600">{reports.length} records</div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MasonryLayout
            items={reports}
            renderItem={renderReport}
            columns={3}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={loadMoreReports}
          />
        </div>
      </section>
    </PageLayout>
  );
};

export default ExposurePage;
