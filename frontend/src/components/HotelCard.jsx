import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

function Stars({ count }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < count ? 'text-yellow-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function RatingBadge({ rating }) {
  const color = rating >= 9 ? 'bg-green-600' : rating >= 8 ? 'bg-blue-600' : rating >= 7 ? 'bg-yellow-500' : 'bg-gray-500';
  const label = rating >= 9 ? 'Excelente' : rating >= 8 ? 'Muy bueno' : rating >= 7 ? 'Bueno' : 'Aceptable';
  return (
    <div className="flex items-center gap-2">
      <span className={`${color} text-white text-sm font-bold px-2 py-1 rounded-lg`}>
        {rating?.toFixed(1)}
      </span>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );
}

export function formatPrice(price) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);
}

export default function HotelCard({ hotel, searchParams: sp }) {
  const [searchParams] = useSearchParams();
  const params = sp || Object.fromEntries(searchParams.entries());

  const amenitiesList = hotel.amenities ? hotel.amenities.split(',').slice(0, 4) : [];

  const linkParams = new URLSearchParams({
    ...(params.checkin && { checkin: params.checkin }),
    ...(params.checkout && { checkout: params.checkout }),
    ...(params.guests && { guests: params.guests })
  });

  return (
    <div className="card hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row">
      {/* Image */}
      <div className="md:w-72 flex-shrink-0">
        <img
          src={hotel.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80'}
          alt={hotel.name}
          className="w-full h-52 md:h-full object-cover"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80'; }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link
                to={`/hotel/${hotel.id}?${linkParams.toString()}`}
                className="text-lg font-bold text-indigo-700 hover:text-indigo-800 hover:underline"
              >
                {hotel.name}
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <Stars count={hotel.stars} />
                <span className="text-xs text-gray-500">{hotel.stars} estrellas</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                <svg className="w-4 h-4 inline mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {hotel.neighborhood}, {hotel.city}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              {hotel.rating > 0 && <RatingBadge rating={hotel.rating} />}
              {hotel.review_count > 0 && (
                <p className="text-xs text-gray-400 mt-1">{hotel.review_count.toLocaleString('es-CO')} reseñas</p>
              )}
            </div>
          </div>

          {/* Amenities */}
          {amenitiesList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {amenitiesList.map((a) => (
                <span key={a} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                  {a.trim()}
                </span>
              ))}
              {hotel.amenities && hotel.amenities.split(',').length > 4 && (
                <span className="text-xs text-gray-500">+{hotel.amenities.split(',').length - 4} más</span>
              )}
            </div>
          )}

          {hotel.description && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{hotel.description}</p>
          )}
        </div>

        {/* Price and CTA */}
        <div className="flex items-end justify-between mt-4 pt-4 border-t border-gray-100">
          <div>
            <span className="text-xs text-gray-400">Desde</span>
            <div className="text-2xl font-bold text-gray-800">
              {formatPrice(hotel.price_from)}
            </div>
            <span className="text-xs text-gray-400">por noche</span>
          </div>
          <Link
            to={`/hotel/${hotel.id}?${linkParams.toString()}`}
            className="btn-primary"
          >
            Ver disponibilidad
          </Link>
        </div>
      </div>
    </div>
  );
}
