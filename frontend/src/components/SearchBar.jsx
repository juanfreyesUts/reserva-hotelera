import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../context/AlertContext';

SearchBar.propTypes = {
  initialValues: PropTypes.shape({
    city: PropTypes.string,
    checkin: PropTypes.string,
    checkout: PropTypes.string,
    guests: PropTypes.string,
  }),
  compact: PropTypes.bool,
  isDestino: PropTypes.bool,
  titleSearch: PropTypes.string,
  onFilter: PropTypes.func,
};

export default function SearchBar({ initialValues = {}, compact = false, isDestino = true, titleSearch = 'Buscar Hoteles', onFilter }) {
  const navigate = useNavigate();
  const { error: showError } = useAlert();
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [city, setCity] = useState(initialValues.city || 'Bucaramanga');
  const [checkin, setCheckin] = useState(compact ? initialValues.checkin : today);
  const [checkout, setCheckout] = useState(compact ? initialValues.checkout : tomorrow);
  const [guests, setGuests] = useState(initialValues.guests || '2');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (isDestino) {
      const params = new URLSearchParams({ city, checkin, checkout, guests });
      navigate(`/search?${params.toString()}`);
    } else if (onFilter) {
      if (!checkin || !checkout) {
        await showError('Selecciona las fechas de llegada y salida para filtrar disponibilidad.', 'Fechas requeridas');
        return;
      }
      onFilter({ checkin, checkout, guests });
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleSearch} className={`flex flex-wrap gap-2 items-end bg-white p-3 rounded-xl shadow-sm border border-gray-200 ${isDestino ? 'w-full' : 'w-fit'}`}>
        {isDestino && (
          <div className="flex-1 min-w-[140px]">
            <label htmlFor="sb-city" className="block text-xs text-gray-500 mb-1">Destino</label>
            <input
              id="sb-city"
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ciudad o hotel"
            />
          </div>
        )}
        <div className="min-w-[130px]">
          <label htmlFor="sb-checkin" className="block text-xs text-gray-500 mb-1">Entrada</label>
          <input
            id="sb-checkin"
            type="date"
            value={checkin}
            required
            min={today}
            onChange={e => setCheckin(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="min-w-[130px]">
          <label htmlFor="sb-checkout" className="block text-xs text-gray-500 mb-1">Salida</label>
          <input
            id="sb-checkout"
            type="date"
            value={checkout}
            required
            min={today}
            onChange={e => setCheckout(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="min-w-[80px]">
          <label htmlFor="sb-guests" className="block text-xs text-gray-500 mb-1">Huéspedes</label>
          <select
            id="sb-guests"
            value={guests}
            required
            onChange={e => setGuests(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>)}
          </select>
        </div>
        <button type="submit" className="btn-primary text-sm py-1.5 px-4 whitespace-nowrap">
          {titleSearch}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSearch} className="bg-yellow-400 p-2 rounded-2xl shadow-2xl">
      <div className="bg-white rounded-xl p-1 flex flex-wrap md:flex-nowrap gap-0">
        {/* Destination */}
        <div className="flex-1 min-w-[200px] border-b md:border-b-0 md:border-r border-gray-200 px-4 py-3">
          <label htmlFor="sbf-city" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Destino
          </label>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input
              id="sbf-city"
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full text-gray-800 text-sm font-medium focus:outline-none placeholder-gray-400"
              placeholder="¿A dónde vas?"
              required
            />
          </div>
        </div>

        {/* Check-in */}
        <div className="flex-1 min-w-[150px] border-b md:border-b-0 md:border-r border-gray-200 px-4 py-3">
          <label htmlFor="sbf-checkin" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Llegada
          </label>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input
              id="sbf-checkin"
              type="date"
              value={checkin}
              min={today}
              onChange={e => { setCheckin(e.target.value); if (e.target.value >= checkout) setCheckout(''); }}
              className="w-full text-gray-800 text-sm font-medium focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Check-out */}
        <div className="flex-1 min-w-[150px] border-b md:border-b-0 md:border-r border-gray-200 px-4 py-3">
          <label htmlFor="sbf-checkout" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Salida
          </label>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input
              id="sbf-checkout"
              type="date"
              value={checkout}
              min={checkin || today}
              onChange={e => setCheckout(e.target.value)}
              className="w-full text-gray-800 text-sm font-medium focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Guests */}
        <div className="flex-1 min-w-[130px] px-4 py-3">
          <label htmlFor="sbf-guests" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Huéspedes
          </label>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <select
              id="sbf-guests"
              value={guests}
              onChange={e => setGuests(e.target.value)}
              className="w-full text-gray-800 text-sm font-medium focus:outline-none bg-transparent"
            >
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-2">
        <button
          type="submit"
          className="w-full md:w-auto bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-3 px-12 rounded-xl text-lg transition-colors shadow-lg"
        >
          {titleSearch}
        </button>
      </div>
    </form>
  );
}
