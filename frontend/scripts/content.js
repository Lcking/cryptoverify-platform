// Minimal content snapshot for prerender SEO meta
// Keep in sync with src/data/mock.js where possible

module.exports = {
  insights: [
    { slug: 'layer-2-scaling-outlook', title: 'Layer 2 Scaling Outlook', excerpt: 'How rollups and zk proofs shape performance trajectory.', author: 'Research Desk', timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), read: '7 min' },
    { slug: 'institutional-adoption-curve', title: 'Institutional Adoption Curve', excerpt: 'Tracking custody growth and flows as rails mature.', author: 'Market Analytics', timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), read: '6 min' },
    { slug: 'security-incidents-review', title: 'Security Incidents Review', excerpt: 'Key exploit patterns and mitigation posture observed across Q1.', author: 'Security Lab', timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), read: '8 min' }
  ],
  exposureReports: [
    { slug: 'quicktrade24', platform: 'QuickTrade24', type: 'Fake License', severity: 'High', status: 'Warning Issued', reportedDate: '2024-01-14T09:10:00Z', summary: 'Operating without a valid regulatory license while claiming approval. Multiple user withdrawal delays reported.' },
    { slug: 'primefx-option', platform: 'PrimeFX Option', type: 'Ponzi Scheme', severity: 'Critical', status: 'Confirmed Fraud', reportedDate: '2024-01-10T15:25:00Z', summary: 'Unsustainable daily return promises with referral tree and blocked withdrawals after “upgrade fee”.' },
    { slug: 'safecoin-earn', platform: 'SafeCoin Earn', type: 'Exit Scam', severity: 'Critical', status: 'Investigating', reportedDate: '2024-01-12T11:40:00Z', summary: 'Staking pool drained to anonymous wallets. Social channels deleted within 30 minutes of fund movement.' }
  ]
};
