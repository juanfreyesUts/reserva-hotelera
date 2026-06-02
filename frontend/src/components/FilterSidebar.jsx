import React from 'react';
import PropTypes from 'prop-types';
import { formatThousands, parseThousands } from '../utils/numberFormat';

FilterSidebar.propTypes = {
  filters: PropTypes.shape({
    stars: PropTypes.arrayOf(PropTypes.number),
    minPrice: PropTypes.string,
    maxPrice: PropTypes.string,
    amenities: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default function FilterSidebar({ filters, onChange }) {
  const { stars = [], minPrice = '', maxPrice = '', amenities: selectedAmenities = [] } = filters;

  const commonAmenities = ['WiFi', 'Piscina', 'Spa', 'Restaurante', 'Gimnasio', 'Parqueadero', 'Bar', 'Desayuno incluido'];

  const toggleStar = (s) => {
    const updated = stars.includes(s) ? stars.filter(x => x !== s) : [...stars, s];
    onChange({ ...filters, stars: updated });
  };

  const toggleAmenity = (a) => {
    const updated = selectedAmenities.includes(a)
      ? selectedAmenities.filter(x => x !== a)
      : [...selectedAmenities, a];
    onChange({ ...filters, amenities: updated });
  };

  const clearAll = () => onChange({ stars: [], minPrice: '', maxPrice: '', amenities: [] });

  const hasFilters = stars.length > 0 || minPrice || maxPrice || selectedAmenities.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 text-lg">Filtros</h3>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-indigo-600 hover:underline font-medium">
            Limpiar todo
          </button>
        )}
      </div>

      {/* Stars */}
      <div className="mb-5">
        <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Categoría</h4>
        {[5, 4, 3, 2, 1].map(s => (
          <label key={s} className="flex items-center gap-2 py-1.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={stars.includes(s)}
              onChange={() => toggleStar(s)}
              className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            />
            <div className="flex items-center gap-1">
              {Array.from({ length: s }).map((_, i) => (
                <svg key={`star-${s}-${i}`} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-sm text-gray-600 ml-1 group-hover:text-indigo-600">{s} {s === 1 ? 'estrella' : 'estrellas'}</span>
            </div>
          </label>
        ))}
      </div>

      {/* Price range */}
      <div className="mb-5">
        <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Precio por noche</h4>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label htmlFor="filter-min-price" className="text-xs text-gray-500 mb-1 block">Mínimo (COP)</label>
            <input
              id="filter-min-price"
              type="text"
              inputMode="numeric"
              value={formatThousands(minPrice)}
              onChange={e => onChange({ ...filters, minPrice: parseThousands(e.target.value) })}
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <span className="text-gray-400 mt-5">—</span>
          <div className="flex-1">
            <label htmlFor="filter-max-price" className="text-xs text-gray-500 mb-1 block">Máximo (COP)</label>
            <input
              id="filter-max-price"
              type="text"
              inputMode="numeric"
              value={formatThousands(maxPrice)}
              onChange={e => onChange({ ...filters, maxPrice: parseThousands(e.target.value) })}
              placeholder="1.000.000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        {/* Quick price buttons */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {[
            { label: 'Hasta $100k', max: '100000' },
            { label: 'Hasta $200k', max: '200000' },
            { label: 'Hasta $500k', max: '500000' }
          ].map(p => (
            <button
              key={p.label}
              onClick={() => onChange({ ...filters, maxPrice: p.max })}
              className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                maxPrice === p.max
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-gray-300 text-gray-600 hover:border-indigo-400'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Servicios</h4>
        {commonAmenities.map(a => (
          <label key={a} className="flex items-center gap-2 py-1.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={selectedAmenities.includes(a)}
              onChange={() => toggleAmenity(a)}
              className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-600 group-hover:text-indigo-600">{a}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
