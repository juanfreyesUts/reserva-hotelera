import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { formatDate } from '../utils/dateFormat';
import { formatPrice } from '../utils/numberFormat';

export default function BookingConfirmation() {
  const { state } = useLocation();

  if (!state?.booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-700 mb-3">No se encontró la confirmación</h2>
        <Link to="/" className="btn-primary">Volver al inicio</Link>
      </div>
    );
  }

  const { booking, room, hotel, nights, checkin, checkout } = state;
  const confirmationCode = `SH-${booking.id?.toString().padStart(6, '0') || '000001'}`;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800">¡Reserva confirmada!</h1>
          <p className="text-gray-500 mt-2">Hemos enviado los detalles a {booking.guest_email}</p>
        </div>

        {/* Confirmation card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Confirmation code banner */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-5 text-white">
            <p className="text-indigo-200 text-sm font-medium uppercase tracking-wide">Número de confirmación</p>
            <p className="text-3xl font-extrabold tracking-widest mt-1">{confirmationCode}</p>
            <p className="text-indigo-200 text-xs mt-1">Guarda este código para cualquier consulta</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Hotel info */}
            {hotel && (
              <div className="flex items-start gap-4 pb-5 border-b border-gray-100">
                <img
                  src={hotel.image_url}
                  alt={hotel.name}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=80'; }}
                />
                <div>
                  <h2 className="font-bold text-gray-800 text-lg">{hotel.name}</h2>
                  <p className="text-gray-500 text-sm">{hotel.address}</p>
                  <p className="text-gray-500 text-sm">{hotel.neighborhood}, {hotel.city}</p>
                </div>
              </div>
            )}

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Check-in</p>
                <p className="font-bold text-gray-800">{formatDate(checkin)}</p>
                <p className="text-xs text-gray-500 mt-0.5">desde las 3:00 pm</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Check-out</p>
                <p className="font-bold text-gray-800">{formatDate(checkout)}</p>
                <p className="text-xs text-gray-500 mt-0.5">hasta las 12:00 pm</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Habitación</p>
                <p className="font-bold text-gray-800">{room?.name || 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-0.5">{nights} {nights === 1 ? 'noche' : 'noches'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Huéspedes</p>
                <p className="font-bold text-gray-800">{booking.guests} {Number.parseInt(booking.guests, 10) === 1 ? 'persona' : 'personas'}</p>
              </div>
            </div>

            {/* Guest info */}
            <div className="pb-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-2">Datos del huésped</p>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Nombre:</span> {booking.guest_name}</p>
                <p><span className="font-medium">Email:</span> {booking.guest_email}</p>
                {booking.guest_phone && <p><span className="font-medium">Teléfono:</span> {booking.guest_phone}</p>}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total pagado</p>
                <p className="text-2xl font-bold text-indigo-700">{formatPrice(booking.total_price)}</p>
                <p className="text-xs text-gray-400">Impuestos incluidos</p>
              </div>
              <div>
                <span className="bg-green-100 text-green-700 text-sm font-bold px-4 py-2 rounded-full">
                  ✓ Confirmada
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Link to="/dashboard" className="flex-1 btn-primary text-center py-3">
            Ver mis reservas
          </Link>
          <Link to="/" className="flex-1 btn-secondary text-center py-3">
            Buscar más hoteles
          </Link>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-blue-800 mb-2">Información importante</p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Presenta tu documento de identidad al hacer check-in</li>
            <li>• El pago se realiza directamente en el hotel</li>
            <li>• Puedes cancelar desde el panel de "Mis reservas"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
