import React from 'react';
import { useParams, Link } from 'react-router-dom';
import PageLayout from '../layout/PageLayout';
import Breadcrumbs from '../ui/Breadcrumbs';
import { insights } from '../../data/mock';

const InsightsDetailPage = () => {
  const { slug } = useParams();
  const item = insights.find(n => n.slug === slug);

  if (!item) {
    return (
      <PageLayout title="Insight Not Found" description="We couldn't find the requested insight.">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <p className="text-slate-500">It may have been moved or removed.</p>
          <div className="mt-6">
            <Link className="text-blue-600 hover:underline" to="/insights">Back to Insights</Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={item.title} description={item.excerpt}>
      <article className="max-w-3xl mx-auto px-4 py-10">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Insights', to: '/insights' }, { label: item.title }]} className="mb-4" />
        <Link to="/insights" className="text-blue-600 hover:underline">← Back to Insights</Link>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">{item.title}</h1>
        <div className="mt-2 text-sm text-slate-500">
          <span>{new Date(item.timestamp).toLocaleString()}</span>
          <span className="mx-2">•</span>
          <span>{item.author}</span>
          <span className="mx-2">•</span>
          <span>{item.read} read</span>
        </div>
        <div className="mt-6 prose max-w-none">
          <p>{item.excerpt}</p>
          <p>
            This deep-dive explores signals, counterpoints, and practical implications for teams and operators.
            It aims to be actionable, concise, and forward-looking, avoiding hype while highlighting real traction.
          </p>
          <h3>Key Takeaways</h3>
          <ul>
            <li>Context framing and scope boundaries</li>
            <li>Primary drivers and adoption constraints</li>
            <li>Operational considerations and metrics</li>
          </ul>
        </div>
      </article>
    </PageLayout>
  );
};

export default InsightsDetailPage;
