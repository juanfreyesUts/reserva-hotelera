import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import RoomCard from '../components/RoomCard';
import SearchBar from '../components/SearchBar';
import StarRating from '../components/StarRating';

const RATING_LABELS = [
  { min: 9, label: 'Excelente' },
  { min: 8, label: 'Muy bueno' },
  { min: 0, label: 'Bueno'     },
];
function hotelRatingLabel(rating) {
  return (RATING_LABELS.find(r => rating >= r.min) ?? RATING_LABELS.at(-1)).label;
}
import { hotelsApi, roomsApi } from '../services/api';
import { formatDate } from '../utils/dateFormat';

const AMENITY_ICONS = {
  'WiFi': '📶',
  'Piscina': '🏊',
  'Spa': '💆',
  'Restaurante': '🍽️',
  'Gimnasio': '🏋️',
  'Parqueadero': '🅿️',
  'Bar': '🍸',
  'Aire acondicionado': '❄️',
  'Room service': '🛎️',
  'Lavandería': '👕',
  'Jacuzzi': '🛁',
  'Sala de conferencias': '📊',
  'Zonas verdes': '🌿',
  'Cocina': '🍳',
  'Desayuno incluido': '🥐'
};

export default function HotelDetail() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loadingHotel, setLoadingHotel] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [error, setError] = useState(null);

  const checkin = searchParams.get('checkin') || '';
  const checkout = searchParams.get('checkout') || '';
  const guests = searchParams.get('guests') || '2';

  useEffect(() => {
    setLoadingHotel(true);
    hotelsApi.getById(id)
      .then(res => setHotel(res.data))
      .catch(() => setError('No se pudo cargar el hotel.'))
      .finally(() => setLoadingHotel(false));
  }, [id]);

  useEffect(() => {
    setLoadingRooms(true);
    const params = {};
    if (checkin) params.checkin = checkin;
    if (checkout) params.checkout = checkout;
    roomsApi.getByHotel(id, params)
      .then(res => setRooms(res.data))
      .catch(console.error)
      .finally(() => setLoadingRooms(false));
  }, [id, checkin, checkout]);

  const filteredRooms = rooms.filter(room => room.capacity >= Number(guests));

  if (loadingHotel) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-72 bg-gray-200 rounded-2xl mb-6" />
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg">{error || 'Hotel no encontrado.'}</p>
        <Link to="/" className="btn-primary mt-4 inline-block">Volver al inicio</Link>
      </div>
    );
  }

  const amenitiesList = hotel.amenities ? hotel.amenities.split(',').map(a => a.trim()) : [];

  let roomsContent;
  if (loadingRooms) {
    roomsContent = (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 h-36 animate-pulse" />
        ))}
      </div>
    );
  } else if (filteredRooms.length === 0) {
    roomsContent = (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-3">😔</div>
        <p className="text-gray-600 font-semibold">No hay habitaciones disponibles</p>
        {checkin && checkout && (
          <p className="text-gray-400 text-sm mt-1">
            Para las fechas {formatDate(checkin)} - {formatDate(checkout)} y {guests} huéspedes.
            <br />Intenta con otras fechas o menos huéspedes.
          </p>
        )}
      </div>
    );
  } else {
    roomsContent = (
      <div className="space-y-4">
        {filteredRooms.map(room => (
          <RoomCard
            key={room.id}
            room={room}
            searchParams={{ checkin, checkout, guests }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
        <nav className="text-sm text-gray-500 flex items-center gap-1">
          <Link to="/" className="hover:text-indigo-600">Inicio</Link>
          <span>/</span>
          <Link to={`/search?city=${hotel.city}`} className="hover:text-indigo-600">{hotel.city}</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">{hotel.name}</span>
        </nav>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        {/* Hotel Header */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          {/* Image */}
          <div className="relative h-72 md:h-96">
            <img
              src={hotel.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <StarRating count={hotel.stars} size="w-5 h-5" />
              <h1 className="text-3xl font-extrabold text-white mt-1">{hotel.name}</h1>
              <p className="text-gray-300 flex items-center gap-1 mt-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {hotel.address} — {hotel.neighborhood}, {hotel.city}
              </p>
            </div>
          </div>

          {/* Info bar */}
          <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
              {hotel.rating > 0 && (
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-600 text-white font-bold text-lg px-3 py-1 rounded-xl">
                    {Number.parseFloat(hotel.rating).toFixed(1)}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {hotelRatingLabel(hotel.rating)}
                    </p>
                    <p className="text-xs text-gray-500">{hotel.review_count?.toLocaleString('es-CO')} reseñas</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {hotel.description && (
            <div className="px-6 py-4">
              <p className="text-gray-600 leading-relaxed">{hotel.description}</p>
            </div>
          )}
        </div>

        {/* SearchBar */}
        <div className="mb-6">
          <SearchBar
            compact={true}
            isDestino={false}
            titleSearch={'Aplicar Cambios'}
            initialValues={{ checkin, checkout, guests }}
            onFilter={({ checkin, checkout, guests }) =>
              setSearchParams({ checkin, checkout, guests })
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rooms */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Habitaciones disponibles
              {loadingRooms && <span className="ml-2 text-sm text-gray-400 font-normal">Cargando...</span>}
            </h2>

            {roomsContent}
          </div>

          {/* Amenities Sidebar */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-20">
              <h3 className="font-bold text-gray-800 mb-4">Servicios del hotel</h3>
              {amenitiesList.length > 0 ? (
                <ul className="space-y-2">
                  {amenitiesList.map(a => (
                    <li key={a} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-lg">{AMENITY_ICONS[a] || '✓'}</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">No hay información disponible.</p>
              )}

              <div className="mt-5 pt-5 border-t border-gray-100">
                <h3 className="font-bold text-gray-800 mb-2 text-sm">Ubicación</h3>
                <p className="text-sm text-gray-600">{hotel.address}</p>
                <p className="text-sm text-gray-500">{hotel.neighborhood}, {hotel.city}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
