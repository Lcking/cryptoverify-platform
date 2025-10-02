// Minimal content snapshot for prerender SEO meta
// Keep in sync with src/data/mock.js where possible

module.exports = {
  // Minimal platform snapshots for detail SEO
  platforms: [
    { slug: 'binance', name: 'Binance', summary: 'Largest by volume with wide derivatives products.' },
    { slug: 'coinbase-pro', name: 'Coinbase Pro', summary: 'US regulated, strong compliance & custody.' },
    { slug: 'kraken', name: 'Kraken', summary: 'Advanced features & security reputation.' }
  ],

  // Minimal news snapshots for detail SEO
  news: [
    { slug: 'market-update-1', title: 'Market Update #1', excerpt: 'Concise market update summary describing key movements.' },
    { slug: 'market-update-2', title: 'Market Update #2', excerpt: 'Hourly recap of volatility and flows.' },
    { slug: 'market-update-3', title: 'Market Update #3', excerpt: 'Key headlines impacting major assets.' }
  ],

  // Minimal verification snapshots for detail SEO
  verifications: [
    { slug: 'binance-2025-09-10', platform: 'Binance', title: 'Live trading and withdrawal check (Sept 10, 2025)' },
    { slug: 'coinbase-pro-2025-09-05', platform: 'Coinbase Pro', title: 'Bank transfer in/out & fee audit (Sept 5, 2025)' },
    { slug: 'kraken-2025-09-12', platform: 'Kraken', title: 'Spot & futures liquidity sampling (Sept 12, 2025)' }
  ],

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
