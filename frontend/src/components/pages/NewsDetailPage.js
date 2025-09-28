import React from 'react';
import { useParams, Link } from 'react-router-dom';
import PageLayout from '../layout/PageLayout';
import Breadcrumbs from '../ui/Breadcrumbs';
import { news } from '../../data/mock';

const NewsDetailPage = () => {
  const { slug } = useParams();
  const n = news.find(x => x.slug === slug);

  if (!n) {
    return (
      <PageLayout title="Article Not Found" description="The news you are looking for does not exist.">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-600 mb-6">We couldn't find the article "{slug}".</p>
          <Link to="/news" className="text-blue-600 hover:underline">Back to News</Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={n.title} description={n.content.substring(0, 150)}>
      <article className="py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'News', to: '/news' }, { label: n.title }]} className="mb-4" />
          <div className="text-sm text-gray-500 mb-4 flex items-center justify-between">
            <span className="flex items-center"><i className="fas fa-newspaper mr-1 text-blue-500"></i>{n.source}</span>
            <time>{new Date(n.timestamp).toLocaleString()}</time>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-snug">{n.title}</h1>
          <div className="flex flex-wrap gap-2 mb-6">
            {n.tags.map(t => <span key={t} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">#{t}</span>)}
          </div>
          <p className="text-gray-800 leading-8">{n.content} This is a longer body placeholder for the detail page to simulate a real article content.</p>
          <div className="mt-8">
            <Link to="/news" className="text-blue-600 hover:underline">← Back to News</Link>
          </div>
        </div>
      </article>
    </PageLayout>
  );
};

export default NewsDetailPage;
