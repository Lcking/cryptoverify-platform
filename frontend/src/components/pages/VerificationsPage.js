import React, { useEffect, useMemo, useState } from 'react';
import PageLayout from '../layout/PageLayout';
import Breadcrumbs from '../ui/Breadcrumbs';
import { verifications as mockVerifications } from '../../data/mock';
import siteContent from '../../config/siteContent';
import { Link } from 'react-router-dom';
import { ENABLE_CMS } from '../../config/cms';
import { fetchVerifications, fetchPlatforms } from '../../lib/cmsClient';

const VerificationsPage = () => {
  const [filter, setFilter] = useState('all');
  const [platformOptions, setPlatformOptions] = useState(['all']);
  const [items, setItems] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (ENABLE_CMS) {
        try {
          const res = await fetchVerifications({ page: 1, pageSize: 100 });
          const list = (res?.data || []);
          const sorted = list.sort((a,b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
          if (!cancelled) setItems(sorted);
          // 平台筛选选项来自 CMS 的 platforms 列表
          const pres = await fetchPlatforms({ page: 1, pageSize: 200 });
          const slugs = ['all', ...new Set((pres?.data || []).map(p => p.slug).filter(Boolean))];
          if (!cancelled) setPlatformOptions(slugs);
          return;
        } catch (_) {}
      }
      // fallback to mock
      const list = mockVerifications.slice().sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt));
      if (!cancelled) setItems(list);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter(v => v.platformSlug === filter);
  }, [items, filter]);

  const title = siteContent.pages?.verifications?.title || 'Verifications';
  const desc = siteContent.pages?.verifications?.description || 'Published verification records by editors with operation evidence and checks.';

  return (
    <PageLayout title={title} description={desc} seo={siteContent.pages?.verifications?.seo}>
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
          <div className="text-sm text-gray-600">{filtered.length} records</div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Platform:</span>
            <select value={filter} onChange={e=>setFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
              {platformOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="divide-y bg-white rounded-xl shadow">
            {filtered.map(v => (
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
