import React from 'react';
import { useParams, Link } from 'react-router-dom';
import PageLayout from '../layout/PageLayout';
import Breadcrumbs from '../ui/Breadcrumbs';
import { exposureReports } from '../../data/mock';

const badgeColor = (severity) => {
  switch (severity) {
    case 'Critical':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'High':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Medium':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const ExposureDetailPage = () => {
  const { slug } = useParams();
  const item = exposureReports.find(n => n.slug === slug);

  if (!item) {
    return (
      <PageLayout title="Report Not Found" description="We couldn't find the requested exposure report.">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="mt-6">
            <Link className="text-blue-600 hover:underline" to="/exposure">Back to Exposure</Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={`${item.platform} — ${item.type}`} description={item.summary}>
      <article className="max-w-3xl mx-auto px-4 py-10">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Exposure', to: '/exposure' }, { label: item.platform }]} className="mb-4" />
        <Link to="/exposure" className="text-blue-600 hover:underline">← Back to Exposure</Link>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">{item.platform} — {item.type}</h1>
        <div className="mt-2 text-sm text-slate-500 flex flex-wrap items-center gap-2">
          <span>Reported {new Date(item.reportedDate).toLocaleString()}</span>
          <span className={`px-2 py-0.5 rounded-full border ${badgeColor(item.severity)}`}>{item.severity}</span>
          <span className="px-2 py-0.5 rounded-full border bg-slate-100 text-slate-700 border-slate-200">{item.status}</span>
          <span className="px-2 py-0.5 rounded-full border bg-slate-100 text-slate-700 border-slate-200">{item.reporterCount} reports</span>
        </div>

        <div className="mt-6">
          <p className="text-slate-700">{item.summary}</p>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold text-slate-900">Evidence</h3>
          <ul className="list-disc pl-6 mt-2 text-slate-700">
            {item.evidence.map((e, idx) => (
              <li key={idx}>{e}</li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold text-slate-900">Risk Factors</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {item.riskFactors.map((r, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-full border bg-slate-50 text-slate-700 border-slate-200">{r}</span>
            ))}
          </div>
        </div>

        <div className="mt-8 text-sm text-slate-500">Last update: {new Date(item.lastUpdate).toLocaleString()}</div>
      </article>
    </PageLayout>
  );
};

export default ExposureDetailPage;
