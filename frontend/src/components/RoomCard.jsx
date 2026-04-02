import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TYPE_LABELS = {
  single: 'Individual',
  double: 'Doble',
  suite: 'Suite',
  deluxe: 'Deluxe'
};

const TYPE_COLORS = {
  single: 'bg-blue-100 text-blue-700',
  double: 'bg-green-100 text-green-700',
  suite: 'bg-purple-100 text-purple-700',
  deluxe: 'bg-orange-100 text-orange-700'
};

export function formatPrice(price) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);
}

export default function RoomCard({ room, searchParams = {} }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBook = () => {
    if (!user) {
      const params = new URLSearchParams({ redirect: `/booking?roomId=${room.id}&...` });
      navigate(`/login?${params.toString()}`);
      return;
    }
    const bookingParams = new URLSearchParams({
      roomId: room.id,
      hotelId: room.hotel_id,
      ...(searchParams.checkin && { checkin: searchParams.checkin }),
      ...(searchParams.checkout && { checkout: searchParams.checkout }),
      ...(searchParams.guests && { guests: searchParams.guests })
    });
    navigate(`/booking?${bookingParams.toString()}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="sm:w-48 flex-shrink-0">
          <img
            src={room.image_url || `https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80`}
            alt={room.name}
            className="w-full h-40 sm:h-full object-cover"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80'; }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-gray-800">{room.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[room.type] || 'bg-gray-100 text-gray-700'}`}>
                    {TYPE_LABELS[room.type] || room.type}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Hasta {room.capacity} {room.capacity === 1 ? 'persona' : 'personas'}
                  </span>
                </div>
              </div>
            </div>

            {room.description && (
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{room.description}</p>
            )}
          </div>

          <div className="flex items-end justify-between mt-3 pt-3 border-t border-gray-100">
            <div>
              <div className="text-xl font-bold text-gray-800">{formatPrice(room.price_per_night)}</div>
              <span className="text-xs text-gray-400">por noche</span>
              {searchParams.checkin && searchParams.checkout && (() => {
                const nights = Math.ceil((new Date(searchParams.checkout) - new Date(searchParams.checkin)) / 86400000);
                if (nights > 0) return (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {nights} {nights === 1 ? 'noche' : 'noches'}: {formatPrice(room.price_per_night * nights)}
                  </p>
                );
              })()}
            </div>
            <button
              onClick={handleBook}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors text-sm"
            >
              Reservar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
