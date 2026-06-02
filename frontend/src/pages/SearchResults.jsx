import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import HotelCard from '../components/HotelCard';
import FilterSidebar from '../components/FilterSidebar';
import SearchBar from '../components/SearchBar';
import { hotelsApi } from '../services/api';
import { formatDate } from '../utils/dateFormat';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('rating');
  const [filters, setFilters] = useState({ stars: [], minPrice: '', maxPrice: '', amenities: [] });
  const [showFilters, setShowFilters] = useState(false);

  const city = searchParams.get('city') || '';
  const checkin = searchParams.get('checkin') || '';
  const checkout = searchParams.get('checkout') || '';
  const guests = searchParams.get('guests') || '2';

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ...(city && { city }),
        ...(checkin && { checkin }),
        ...(checkout && { checkout }),
        ...(guests && { guests }),
        ...(filters.stars.length > 0 && { stars: filters.stars.join(',') }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        sort
      };
      const res = await hotelsApi.search(params);
      let results = res.data;

      // Client-side amenity filter — Set.has() es O(1) vs includes() O(n)
      if (filters.amenities.length > 0) {
        const selectedSet = new Set(filters.amenities);
        results = results.filter(h => {
          if (!h.amenities) return false;
          const hotelSet = new Set(h.amenities.split(',').map(a => a.trim()));
          return [...selectedSet].every(a => hotelSet.has(a));
        });
      }

      setHotels(results);
    } catch (err) {
      console.error('Search error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [city, checkin, checkout, guests, filters, sort]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const nights = checkin && checkout
    ? Math.ceil((new Date(checkout) - new Date(checkin)) / MS_PER_DAY)
    : null;

  let hotelsContent;
  if (loading) {
    hotelsContent = (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl shadow-md h-52 animate-pulse flex">
            <div className="w-72 bg-gray-200 rounded-l-xl" />
            <div className="flex-1 p-5 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  } else if (hotels.length === 0) {
    hotelsContent = (
      <div className="bg-white rounded-xl p-12 text-center shadow-sm">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">No se encontraron hoteles</h3>
        <p className="text-gray-500 mb-4">Intenta con otros filtros o cambia las fechas de búsqueda.</p>
        <button
          onClick={() => setFilters({ stars: [], minPrice: '', maxPrice: '', amenities: [] })}
          className="btn-primary"
        >
          Limpiar filtros
        </button>
      </div>
    );
  } else {
    hotelsContent = (
      <div className="space-y-4">
        {hotels.map(hotel => (
          <HotelCard
            key={hotel.id}
            hotel={hotel}
            searchParams={{ checkin, checkout, guests }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Compact Search Bar */}
      <div className="bg-indigo-700 py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <SearchBar
            compact
            initialValues={{ city, checkin, checkout, guests }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Results header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {loading ? 'Buscando hoteles...' : (
                <>
                  <span className="text-indigo-600">{hotels.length}</span> hoteles{city ? ` en "${city}"` : ''}
                </>
              )}
            </h1>
            {Boolean(nights) && nights > 0 && (
              <p className="text-sm text-gray-500">
                {formatDate(checkin)} — {formatDate(checkout)} · {nights} {nights === 1 ? 'noche' : 'noches'} · {guests} {Number.parseInt(guests, 10) === 1 ? 'huésped' : 'huéspedes'}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Filtros
              {(filters.stars.length + filters.amenities.length + (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0)) > 0 && (
                <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {filters.stars.length + filters.amenities.length + (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0)}
                </span>
              )}
            </button>
            {/* Sort */}
            <div className="flex items-center gap-2">
              <label htmlFor="search-sort" className="text-sm text-gray-600 whitespace-nowrap">Ordenar por:</label>
              <select
                id="search-sort"
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="rating">Calificación</option>
                <option value="price_asc">Precio: menor a mayor</option>
                <option value="price_desc">Precio: mayor a menor</option>
                <option value="stars">Estrellas</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className={`w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <FilterSidebar filters={filters} onChange={setFilters} />
          </aside>

          {/* Hotel list */}
          <div className="flex-1 min-w-0">
            {hotelsContent}
          </div>
        </div>
      </div>
    </div>
  );
}
