import React, { useMemo, useState } from 'react';
import PageLayout from '../layout/PageLayout';
import Breadcrumbs from '../ui/Breadcrumbs';
import { verifications, platforms } from '../../data/mock';
import { Link } from 'react-router-dom';

const VerificationsPage = () => {
  const [filter, setFilter] = useState('all');
  const options = useMemo(() => ['all', ...platforms.map(p => p.slug)], []);
  const items = useMemo(() => {
    const list = verifications.slice().sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    if (filter === 'all') return list;
    return list.filter(v => v.platformSlug === filter);
  }, [filter]);

  const title = 'Verifications';
  const desc = 'Published verification records by editors with operation evidence and checks.';

  return (
    <PageLayout title={title} description={desc}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Verifications', to: '/verifications' }
          ]}
        />
      </div>
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="text-sm text-gray-600">{items.length} records</div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Platform:</span>
            <select value={filter} onChange={e=>setFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="divide-y bg-white rounded-xl shadow">
            {items.map(v => (
              <li key={v.slug} className="p-4 flex items-center justify-between">
                <div>
                  <Link to={`/verifications/${v.slug}`} className="text-blue-600 hover:underline font-medium">
                    {v.title}
                  </Link>
                  <div className="text-xs text-gray-500 mt-1">{new Date(v.publishedAt).toLocaleString()}</div>
                </div>
                <i className="fas fa-arrow-right text-gray-400"></i>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageLayout>
  );
};

export default VerificationsPage;
