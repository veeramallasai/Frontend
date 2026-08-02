import React from 'react';
import { Filter, Search } from 'lucide-react';

const LeafyVegetableFilters = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  priceRange,
  onPriceRangeChange,
  selectedWeight,
  onWeightChange,
  availability,
  onAvailabilityChange,
  organicOnly,
  onOrganicToggle,
  weightOptions,
  onResetFilters
}) => {
  return (
    <section className="rounded-3xl border border-emerald-100 bg-white/90 p-4 shadow-sm backdrop-blur sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
          <Filter className="h-4 w-4" />
        </div>
        <h2 className="text-base font-extrabold text-slate-800">Search, Sort and Filter</h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search leafy vegetables"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white"
          />
        </label>

        <select
          value={sortBy}
          onChange={(event) => onSortChange(event.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white"
        >
          <option value="featured">Sort: Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name-asc">Name: A to Z</option>
          <option value="stock-desc">Stock: High to Low</option>
        </select>

        <select
          value={priceRange}
          onChange={(event) => onPriceRangeChange(event.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white"
        >
          <option value="all">Price: All</option>
          <option value="0-30">Up to Rs 30</option>
          <option value="31-60">Rs 31 to Rs 60</option>
          <option value="61-200">Rs 61 and above</option>
        </select>

        <select
          value={selectedWeight}
          onChange={(event) => onWeightChange(event.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white"
        >
          <option value="all">Weight: All</option>
          {weightOptions.map((weightValue) => (
            <option key={weightValue} value={weightValue}>
              {weightValue}
            </option>
          ))}
        </select>

        <select
          value={availability}
          onChange={(event) => onAvailabilityChange(event.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white"
        >
          <option value="all">Availability: All</option>
          <option value="in-stock">In Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>

        <label className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={organicOnly}
            onChange={(event) => onOrganicToggle(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-400"
          />
          Organic products only
        </label>

        <button
          onClick={onResetFilters}
          className="h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-lime-500 px-4 text-sm font-extrabold text-white shadow transition hover:brightness-95"
        >
          Reset Filters
        </button>
      </div>
    </section>
  );
};

export default LeafyVegetableFilters;
