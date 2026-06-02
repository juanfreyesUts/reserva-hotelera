import React from 'react';
import PropTypes from 'prop-types';
import { Link, useSearchParams } from 'react-router-dom';
import { formatPrice } from '../utils/numberFormat';
import StarRating from './StarRating';

const RATING_CONFIG = [
  { min: 9, color: 'bg-green-600', label: 'Excelente' },
  { min: 8, color: 'bg-blue-600',  label: 'Muy bueno' },
  { min: 7, color: 'bg-yellow-500', label: 'Bueno'    },
  { min: 0, color: 'bg-gray-500',  label: 'Aceptable' },
];

function getRating(rating) {
  return RATING_CONFIG.find(r => rating >= r.min) ?? RATING_CONFIG.at(-1);
}

RatingBadge.propTypes = { rating: PropTypes.number.isRequired };
function RatingBadge({ rating }) {
  const { color, label } = getRating(rating);
  return (
    <div className="flex items-center gap-2">
      <span className={`${color} text-white text-sm font-bold px-2 py-1 rounded-lg`}>
        {rating?.toFixed(1)}
      </span>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );
}

HotelCard.propTypes = {
  hotel: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    city: PropTypes.string,
    neighborhood: PropTypes.string,
    stars: PropTypes.number,
    rating: PropTypes.number,
    review_count: PropTypes.number,
    price_from: PropTypes.number,
    image_url: PropTypes.string,
    amenities: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  searchParams: PropTypes.object,
};

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
                <StarRating count={hotel.stars} />
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
              {(hotel.amenities?.split(',').length ?? 0) > 4 && (
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
