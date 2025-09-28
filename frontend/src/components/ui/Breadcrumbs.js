import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumbs = ({ items = [], className = '' }) => {
  if (!items || items.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className={`text-sm ${className}`}>
      <ol className="flex flex-wrap items-center gap-2 text-gray-500">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-2">
              {idx === 0 ? (
                <Link to={item.to || '/'} className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                  <i className="fas fa-home"></i>
                  <span>{item.label || 'Home'}</span>
                </Link>
              ) : isLast ? (
                <span className="text-gray-700 font-medium">{item.label}</span>
              ) : (
                <Link to={item.to} className="text-blue-600 hover:underline">{item.label}</Link>
              )}
              {!isLast && <span className="text-gray-400">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
