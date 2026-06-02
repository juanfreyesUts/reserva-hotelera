import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { roomsApi, bookingsApi, hotelsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { formatDate } from '../utils/dateFormat';
import { formatPrice } from '../utils/numberFormat';
import StarRating from '../components/StarRating';

export default function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { confirm, success, error: showError } = useAlert();

  const roomId = searchParams.get('roomId');
  const hotelId = searchParams.get('hotelId');
  const checkin = searchParams.get('checkin') || '';
  const checkout = searchParams.get('checkout') || '';
  const guestsParam = searchParams.get('guests') || '1';

  const [room, setRoom] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    guest_name: user?.name || '',
    guest_email: user?.email || '',
    guest_phone: user?.phone || '',
    special_requests: '',
    guests: guestsParam
  });

  useEffect(() => {
    if (!roomId || !hotelId) {
      navigate('/');
      return;
    }
    Promise.all([
      roomsApi.getById(roomId),
      hotelsApi.getById(hotelId)
    ])
      .then(([roomRes, hotelRes]) => {
        setRoom(roomRes.data);
        setHotel(hotelRes.data);
      })
      .catch(() => setError('No se pudo cargar la información de la reserva.'))
      .finally(() => setLoading(false));
  }, [roomId, hotelId, navigate]);

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const nights = checkin && checkout
    ? Math.ceil((new Date(checkout) - new Date(checkin)) / MS_PER_DAY)
    : 0;

  const totalPrice = room ? room.price_per_night * nights : 0;

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!checkin || !checkout || nights <= 0) {
      setError('Fechas de reserva inválidas.');
      return;
    }

    const ok = await confirm(
      `¿Confirmas la reserva de "${room?.name}" en ${hotel?.name} del ${formatDate(checkin)} al ${formatDate(checkout)} por ${formatPrice(totalPrice)}?`,
      'Confirmar reserva'
    );
    if (!ok) return;

    setSubmitting(true);
    try {
      const res = await bookingsApi.create({
        room_id: Number.parseInt(roomId, 10),
        hotel_id: Number.parseInt(hotelId, 10),
        check_in: checkin,
        check_out: checkout,
        guests: Number.parseInt(form.guests, 10),
        guest_name: form.guest_name,
        guest_email: form.guest_email,
        guest_phone: form.guest_phone,
        special_requests: form.special_requests
      });

      await success('Tu reserva fue creada exitosamente.', 'Reserva confirmada');
      navigate('/booking/confirmation', {
        state: { booking: res.data, room, hotel, nights, checkin, checkout }
      });
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al crear la reserva. Inténtalo nuevamente.';
      setError(msg);
      await showError(msg, 'No se pudo crear la reserva');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-2xl h-96" />
          <div className="lg:col-span-2 bg-white rounded-2xl h-64" />
        </div>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-red-600">{error}</p>
        <button onClick={() => navigate(-1)} className="btn-primary mt-4">Volver</button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm mb-3">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Completar reserva</h1>
          <p className="text-gray-500 text-sm">Rellena los datos a continuación para confirmar tu reserva</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
            {/* Guest info */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-700 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">1</span>{' '}
                Datos del huésped
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="booking-guest_name" className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                  <input
                    id="booking-guest_name"
                    type="text"
                    name="guest_name"
                    value={form.guest_name}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div>
                  <label htmlFor="booking-guest_email" className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
                  <input
                    id="booking-guest_email"
                    type="email"
                    name="guest_email"
                    value={form.guest_email}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="tu@correo.com"
                  />
                </div>
                <div>
                  <label htmlFor="booking-guest_phone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    id="booking-guest_phone"
                    type="tel"
                    name="guest_phone"
                    value={form.guest_phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="300 123 4567"
                  />
                </div>
                <div>
                  <label htmlFor="booking-guests" className="block text-sm font-medium text-gray-700 mb-1">Número de huéspedes *</label>
                  <select
                    id="booking-guests"
                    name="guests"
                    value={form.guests}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    {Array.from({ length: room?.capacity || 4 }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Stay details */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-700 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">2</span>{' '}
                Fechas de estadía
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Llegada</p>
                  <p className="font-bold text-gray-800 mt-1">{formatDate(checkin) || 'No especificada'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Salida</p>
                  <p className="font-bold text-gray-800 mt-1">{formatDate(checkout) || 'No especificada'}</p>
                </div>
              </div>
              {nights > 0 && (
                <p className="text-sm text-indigo-600 font-medium mt-3">
                  Estadía de {nights} {nights === 1 ? 'noche' : 'noches'}
                </p>
              )}
            </div>

            {/* Special requests */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-700 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">3</span>{' '}
                Solicitudes especiales
                <span className="text-xs text-gray-400 font-normal ml-1">(opcional)</span>
              </h2>
              <textarea
                name="special_requests"
                value={form.special_requests}
                onChange={handleChange}
                rows={3}
                className="input-field resize-none"
                placeholder="Ej: Habitación en piso alto, cama extra, llegada tardía..."
              />
              <p className="text-xs text-gray-400 mt-1">Las solicitudes no están garantizadas pero haremos lo posible por atenderlas.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || nights <= 0}
              className="w-full btn-primary py-4 text-lg"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Confirmando reserva...
                </span>
              ) : (
                `Confirmar reserva · ${formatPrice(totalPrice)}`
              )}
            </button>
          </form>

          {/* Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-20">
              <h2 className="font-bold text-gray-800 text-lg mb-4">Resumen de tu reserva</h2>

              {hotel && (
                <div className="flex gap-3 mb-4 pb-4 border-b border-gray-100">
                  <img
                    src={hotel.image_url}
                    alt={hotel.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=80'; }}
                  />
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{hotel.name}</p>
                    <p className="text-xs text-gray-500">{hotel.neighborhood}, {hotel.city}</p>
                    <div className="flex mt-1">
                      <StarRating count={hotel.stars || 0} size="w-3 h-3" />
                    </div>
                  </div>
                </div>
              )}

              {room && (
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Habitación</p>
                  <p className="font-semibold text-gray-800">{room.name}</p>
                  <p className="text-sm text-gray-500">Hasta {room.capacity} {room.capacity === 1 ? 'persona' : 'personas'}</p>
                </div>
              )}

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>{formatPrice(room?.price_per_night || 0)} × {nights} {nights === 1 ? 'noche' : 'noches'}</span>
                  <span>{formatPrice((room?.price_per_night || 0) * nights)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Impuestos incluidos</span>
                  <span className="text-green-600">Incluidos</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="font-bold text-gray-800">Total</span>
                <span className="font-bold text-xl text-indigo-700">{formatPrice(totalPrice)}</span>
              </div>

              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3">
                <p className="text-xs text-green-700 font-medium">
                  ✓ Cancelación gratuita disponible antes del check-in
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
