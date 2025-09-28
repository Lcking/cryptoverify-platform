// Shared mock data for lists and details
// Minimal Verification type for mock
// { id, slug, title, publishedAt, platformSlug }

export const platforms = [
  { id: 1, slug: 'binance', name: 'Binance', score: 9.8, business: 'Global Exchange', summary: 'Largest by volume with wide derivatives products.', pairs: 1400, volume: '$15.2B', established: 2017, logo: 'https://via.placeholder.com/64x64/f3b322/ffffff?text=BN', verified: true, verificationCount: 3 },
  { id: 2, slug: 'coinbase-pro', name: 'Coinbase Pro', score: 9.5, business: 'Regulated Exchange', summary: 'US regulated, strong compliance & custody.', pairs: 250, volume: '$2.8B', established: 2012, logo: 'https://via.placeholder.com/64x64/0052ff/ffffff?text=CB', verified: true, verificationCount: 2 },
  { id: 3, slug: 'kraken', name: 'Kraken', score: 9.3, business: 'Professional Exchange', summary: 'Advanced features & security reputation.', pairs: 400, volume: '$1.2B', established: 2011, logo: 'https://via.placeholder.com/64x64/5741d9/ffffff?text=KR', verified: true, verificationCount: 1 },
  { id: 4, slug: 'huobi', name: 'Huobi', score: 8.7, business: 'Global Digital Asset', summary: 'Wide altcoin support & derivatives.', pairs: 600, volume: '$800M', established: 2013, verified: false, verificationCount: 0 },
  { id: 5, slug: 'kucoin', name: 'KuCoin', score: 8.4, business: 'Altcoin Exchange', summary: 'Known for emerging token listings.', pairs: 700, volume: '$600M', established: 2017, verified: false, verificationCount: 0 }
];

export const verifications = [
  { id: 101, slug: 'binance-2025-09-10', title: 'Live trading and withdrawal check (Sept 10, 2025)', publishedAt: '2025-09-10T10:00:00Z', platformSlug: 'binance' },
  { id: 102, slug: 'binance-2025-08-20', title: 'Derivatives margin test (Aug 20, 2025)', publishedAt: '2025-08-20T12:00:00Z', platformSlug: 'binance' },
  { id: 103, slug: 'binance-2025-07-01', title: 'Account KYC & 2FA enforcement check (Jul 1, 2025)', publishedAt: '2025-07-01T09:30:00Z', platformSlug: 'binance' },
  { id: 201, slug: 'coinbase-pro-2025-09-05', title: 'Bank transfer in/out & fee audit (Sept 5, 2025)', publishedAt: '2025-09-05T14:00:00Z', platformSlug: 'coinbase-pro' },
  { id: 202, slug: 'coinbase-pro-2025-08-10', title: 'Custody & cold storage policy review (Aug 10, 2025)', publishedAt: '2025-08-10T16:30:00Z', platformSlug: 'coinbase-pro' },
  { id: 301, slug: 'kraken-2025-09-12', title: 'Spot & futures liquidity sampling (Sept 12, 2025)', publishedAt: '2025-09-12T11:15:00Z', platformSlug: 'kraken' }
];

export const news = Array.from({ length: 6 }).map((_, i) => ({
  id: i + 1,
  slug: `market-update-${i + 1}`,
  title: `Market Update #${i + 1}`,
  content: 'Concise crypto market update summary describing key movements and sentiment shifts across major assets.',
  source: 'CryptoWire',
  timestamp: new Date(Date.now() - i * 3600 * 1000).toISOString(),
  tags: ['Bitcoin', 'Volatility', 'Macro']
}));

// Insights mock with slugs
export const insights = [
  { id: 1, slug: 'layer-2-scaling-outlook', title: 'Layer 2 Scaling Outlook', excerpt: 'How rollups and zk proofs shape performance trajectory.', author: 'Research Desk', category: 'Technology', read: '7 min', timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
  { id: 2, slug: 'institutional-adoption-curve', title: 'Institutional Adoption Curve', excerpt: 'Tracking custody growth and flows as rails mature.', author: 'Market Analytics', category: 'Market', read: '6 min', timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString() },
  { id: 3, slug: 'security-incidents-review', title: 'Security Incidents Review', excerpt: 'Key exploit patterns and mitigation posture observed across Q1.', author: 'Security Lab', category: 'Security', read: '8 min', timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString() }
];

// Exposure reports mock with slugs
export const exposureReports = [
  {
    id: 1,
    slug: 'quicktrade24',
    platform: 'QuickTrade24',
    type: 'Fake License',
    severity: 'High',
    status: 'Warning Issued',
    reportedDate: '2024-01-14T09:10:00Z',
    summary: 'Operating without a valid regulatory license while claiming approval. Multiple user withdrawal delays reported.',
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
    slug: 'primefx-option',
    platform: 'PrimeFX Option',
    type: 'Ponzi Scheme',
    severity: 'Critical',
    status: 'Confirmed Fraud',
    reportedDate: '2024-01-10T15:25:00Z',
    summary: 'Unsustainable daily return promises with referral tree and blocked withdrawals after “upgrade fee”.',
    evidence: [
      'Contract shows fund recycling pattern',
      'On-chain analysis of large internal transfers',
      'Refused third-party code audit'
    ],
    riskFactors: ['Unrealistic ROI', 'Referral Pyramid', 'Contract Obfuscation'],
    reporterCount: 52,
    lastUpdate: '2024-01-15T07:30:00Z'
  },
  {
    id: 3,
    slug: 'safecoin-earn',
    platform: 'SafeCoin Earn',
    type: 'Exit Scam',
    severity: 'Critical',
    status: 'Investigating',
    reportedDate: '2024-01-12T11:40:00Z',
    summary: 'Staking pool drained to anonymous wallets. Social channels deleted within 30 minutes of fund movement.',
    evidence: [
      'Tx hash cluster to mixers',
      'Deleted official social accounts',
      'Frontend serving 404 after redirect'
    ],
    riskFactors: ['Liquidity Drain', 'Social Silence', 'Mixer Routing'],
    reporterCount: 34,
    lastUpdate: '2024-01-15T05:10:00Z'
  }
];
