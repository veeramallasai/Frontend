import React from 'react';
import { LayoutGrid } from 'lucide-react';

const CategoryCard = ({ category, isSelected, onClick }) => {
  const { id, name, image, backendCategory } = category;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(category);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(category)}
      onKeyDown={handleKeyDown}
      title={`Browse ${name}`}
      aria-label={`Category ${name}`}
      className={`shrink-0 flex flex-col items-center justify-center p-2 rounded-[12px] bg-white border text-center cursor-pointer transition-all duration-200 select-none ${
        isSelected
          ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md bg-emerald-50/20 -translate-y-1'
          : 'border-slate-200 hover:border-emerald-500 hover:shadow-md hover:-translate-y-[3px]'
      }`}
      style={{
        width: '130px',
        height: '130px',
        borderRadius: '12px',
        boxSizing: 'border-box',
      }}
    >
      {/* Category Image or Icon Container */}
      <div className="w-[75px] h-[65px] flex items-center justify-center mb-1 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="w-[75px] h-[65px] object-contain transition-transform duration-200 hover:scale-105"
            style={{ width: '75px', height: '65px', objectFit: 'contain' }}
          />
        ) : (
          <div className="w-[50px] h-[50px] rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <LayoutGrid className="w-7 h-7" />
          </div>
        )}
      </div>

      {/* Category Label */}
      <span
        className={`text-[14px] font-semibold tracking-tight truncate max-w-full leading-snug ${
          isSelected ? 'text-emerald-700 font-bold' : 'text-[#202124]'
        }`}
        style={{ fontSize: '14px', fontWeight: 600, color: isSelected ? '#059669' : '#202124' }}
      >
        {name}
      </span>
    </div>
  );
};

export default CategoryCard;
