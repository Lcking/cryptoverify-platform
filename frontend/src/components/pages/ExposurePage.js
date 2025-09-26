import React, { useState, useEffect } from 'react';
import PageLayout from '../layout/PageLayout';
import MasonryLayout from '../ui/MasonryLayout';

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

  const mockExposureData = [
    {
      id: 1,
      platform: 'QuickTrade24',
      type: 'Fake License',
      severity: 'High',
      status: 'Warning Issued',
      reportedDate: '2024-01-14T09:10:00Z',
      summary: 'Operating without a valid regulatory license while claiming FCA approval. Multiple user withdrawal delays reported.',
      evidence: [
        'Screenshots of falsified license number',
        'User complaints about frozen funds',
        'Mismatch between claimed address and registry records'
      ],
      riskFactors: ['License Forgery', 'Withdrawal Delay', 'False Address'],
      reporterCount: 18,
      lastUpdate: '2024-01-15T08:00:00Z'
    },
    {
      id: 2,
      platform: 'PrimeFX Option',
      type: 'Ponzi Scheme',
      severity: 'Critical',
      status: 'Confirmed Fraud',
      reportedDate: '2024-01-10T15:25:00Z',
      summary: 'Unsustainable daily return promises (6–10%) with referral multi-level tree and blocked withdrawals after “upgrade fee” prompts.',
      evidence: [
        'Smart contract shows fund recycling pattern',
        'On-chain analysis of large internal transfers',
        'Refused third-party code audit'
      ],
      riskFactors: ['Unrealistic ROI', 'Referral Pyramid', 'Contract Obfuscation'],
      reporterCount: 52,
      lastUpdate: '2024-01-15T07:30:00Z'
    },
    {
      id: 3,
      platform: 'SafeCoin Earn',
      type: 'Exit Scam',
      severity: 'Critical',
      status: 'Investigating',
      reportedDate: '2024-01-12T11:40:00Z',
      summary: 'Staking pool drained to anonymous wallets. Social media channels deleted within 30 minutes of fund movement.',
      evidence: [
        'Tx hash cluster to mixers',
        'Deleted official Twitter & Telegram',
        'Frontend now serving 404 after redirect'
      ],
      riskFactors: ['Liquidity Drain', 'Social Silence', 'Mixer Routing'],
      reporterCount: 34,
      lastUpdate: '2024-01-15T05:10:00Z'
    },
    {
      id: 4,
      platform: 'BitMeta Global',
      type: 'Data Manipulation',
      severity: 'Medium',
      status: 'Warning Issued',
      reportedDate: '2024-01-13T13:15:00Z',
      summary: 'Reported artificial volume inflation (wash trading patterns) and inconsistent API orderbook depth snapshots.',
      evidence: [
        'Orderbook identical snapshots across 2h',
        'Self-trade loops flagged by pattern detection',
        'External aggregator mismatch (‑78%)'
      ],
      riskFactors: ['Wash Trading', 'API Inconsistency'],
      reporterCount: 11,
      lastUpdate: '2024-01-15T04:05:00Z'
    },
    {
      id: 5,
      platform: 'AlphaNode Vault',
      type: 'Locked Funds',
      severity: 'High',
      status: 'User Reports Rising',
      reportedDate: '2024-01-11T10:00:00Z',
      summary: 'Users cannot unlock staked assets after lock period. Support only replies with automated messages demanding KYC resubmission.',
      evidence: [
        'Batch of support ticket screenshots',
        'Contract shows modified lock variable',
        'Hash of updated proxy implementation'
      ],
      riskFactors: ['Forced Retention', 'Proxy Upgrade Risk'],
      reporterCount: 21,
      lastUpdate: '2024-01-14T18:30:00Z'
    }
  ];

  // Initial load
  useEffect(() => {
    loadInitialReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [severityFilter, typeFilter]);

  const loadInitialReports = () => {
    setLoading(true);
    setTimeout(() => {
      let data = [...mockExposureData];
      if (severityFilter !== 'all') {
        data = data.filter(r => r.severity.toLowerCase() === severityFilter);
      }
      if (typeFilter !== 'all') {
        data = data.filter(r => r.type.toLowerCase().includes(typeFilter));
      }
      // Sort by severity (Critical > High > Medium > Low) then newest
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
    }, 600);
  };

  const loadMoreReports = () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      // Simulate duplication with new IDs & timestamps
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
    }, 800);
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
    <article className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border-l-4 ${
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
        <button className="text-blue-600 hover:text-blue-700 font-medium">View Details →</button>
      </div>
    </article>
  );

  const pageTitle = 'Fraud Exposure & Risk Alerts';
  const pageDescription = 'Verified community and analytic reports exposing fraudulent or high-risk cryptocurrency platforms with evidence.';

  return (
    <PageLayout title={pageTitle} description={pageDescription}>
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
