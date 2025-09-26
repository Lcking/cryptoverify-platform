import React, { useState, useEffect } from 'react';

const MasonryLayout = ({ 
  items = [], 
  renderItem, 
  columns = 3, 
  gap = '1.5rem',
  loading = false,
  hasMore = true,
  onLoadMore
}) => {
  const [itemsInColumns, setItemsInColumns] = useState(new Array(columns).fill(null).map(() => []));

  useEffect(() => {
    const newCols = new Array(columns).fill(null).map(() => []);
    const heights = new Array(columns).fill(0);
    items.forEach((item, idx) => {
      const target = heights.indexOf(Math.min(...heights));
      newCols[target].push({ ...item, _i: idx });
      heights[target] += estimateHeight(item);
    });
    setItemsInColumns(newCols);
  }, [items, columns]);

  const estimateHeight = (item) => {
    let h = 160;
    if (item.title) h += Math.min(80, Math.ceil(item.title.length / 40) * 22);
    if (item.content || item.excerpt || item.summary) {
      const text = item.content || item.excerpt || item.summary;
      h += Math.min(140, Math.ceil(text.length / 80) * 18);
    }
    if (item.image) h += 120;
    return h;
  };

  // Infinite scroll trigger
  useEffect(() => {
    const onScroll = () => {
      if (loading || !hasMore) return;
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - 800) {
        onLoadMore && onLoadMore();
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [loading, hasMore, onLoadMore]);

  const colClass = () => {
    switch (columns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <div className="w-full">
      <div className={`grid ${colClass()} gap-6`} style={{ gap }}>
        {itemsInColumns.map((col, ci) => (
          <div key={ci} className="flex flex-col space-y-6">
            {col.map(c => (
              <div key={`${ci}-${c._i}`}>{renderItem(c, c._i)}</div>
            ))}
          </div>
        ))}
      </div>
      {loading && (
        <div className="flex justify-center py-10">
          <div className="flex items-center space-x-3 text-gray-600">
            <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
            <span>Loading more...</span>
          </div>
        </div>
      )}
      {!hasMore && items.length > 0 && (
        <div className="text-center py-10 text-sm text-gray-500">No more content</div>
      )}
      {!loading && items.length === 0 && (
        <div className="text-center py-16 text-gray-500">No data available</div>
      )}
    </div>
  );
};

export default MasonryLayout;