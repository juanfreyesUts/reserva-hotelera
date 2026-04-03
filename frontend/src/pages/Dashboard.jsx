import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateFormat';

function formatPrice(price) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);
}

function StatusBadge({ status }) {
  const config = {
    confirmed: { label: 'Confirmada', classes: 'bg-green-100 text-green-700 border-green-200' },
    pending: { label: 'Pendiente', classes: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    cancelled: { label: 'Cancelada', classes: 'bg-red-100 text-red-700 border-red-200' }
  };
  const s = config[status] || { label: status, classes: 'bg-gray-100 text-gray-700 border-gray-200' };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${s.classes}`}>
      {s.label}
    </span>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    bookingsApi.getMy()
      .then(res => setBookings(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) return;
    setCancelling(id);
    try {
      await bookingsApi.cancel(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cancelar reserva.');
    } finally {
      setCancelling(null);
    }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const today = new Date().toISOString().split('T')[0];

  const upcoming = bookings.filter(b => b.status === 'confirmed' && b.check_in >= today).length;
  const past = bookings.filter(b => b.check_out < today).length;
  const cancelled = bookings.filter(b => b.status === 'cancelled').length;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-indigo-700 text-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white text-indigo-700 rounded-full flex items-center justify-center text-2xl font-extrabold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Hola, {user?.name?.split(' ')[0]}</h1>
              <p className="text-indigo-200">{user?.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{bookings.length}</p>
              <p className="text-indigo-200 text-sm">Total reservas</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{upcoming}</p>
              <p className="text-indigo-200 text-sm">Próximas</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{past}</p>
              <p className="text-indigo-200 text-sm">Completadas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'all', label: `Todas (${bookings.length})` },
            { key: 'confirmed', label: `Confirmadas (${bookings.filter(b => b.status === 'confirmed').length})` },
            { key: 'cancelled', label: `Canceladas (${cancelled})` }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-36 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="text-5xl mb-4">🏨</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              {filter === 'all' ? 'No tienes reservas aún' : `No tienes reservas ${filter === 'confirmed' ? 'confirmadas' : 'canceladas'}`}
            </h3>
            <p className="text-gray-500 mb-6">Explora nuestros hoteles y haz tu primera reserva.</p>
            <Link to="/search?city=Bucaramanga" className="btn-primary">
              Buscar hoteles
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(booking => {
              const nights = Math.ceil((new Date(booking.check_out) - new Date(booking.check_in)) / 86400000);
              const isUpcoming = booking.status === 'confirmed' && booking.check_in >= today;
              const isCancellable = booking.status === 'confirmed' || booking.status === 'pending';

              return (
                <div key={booking.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row">
                    {/* Hotel image */}
                    <div className="sm:w-48 flex-shrink-0">
                      <img
                        src={booking.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80'}
                        alt={booking.hotel_name}
                        className="w-full h-40 sm:h-full object-cover"
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80'; }}
                      />
                    </div>

                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-800">{booking.hotel_name}</h3>
                            <StatusBadge status={booking.status} />
                          </div>
                          <p className="text-sm text-gray-500">{booking.room_name} · {booking.room_type}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Reserva #{booking.id} · {formatDate(booking.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-indigo-700 text-lg">{formatPrice(booking.total_price)}</p>
                          <p className="text-xs text-gray-400">{nights} {nights === 1 ? 'noche' : 'noches'}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(booking.check_in)} → {formatDate(booking.check_out)}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {booking.guests} {parseInt(booking.guests) === 1 ? 'huésped' : 'huéspedes'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {isUpcoming && (
                            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-full font-medium">
                              Próximamente
                            </span>
                          )}
                          {isCancellable && (
                            <button
                              onClick={() => handleCancel(booking.id)}
                              disabled={cancelling === booking.id}
                              className="text-xs text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {cancelling === booking.id ? 'Cancelando...' : 'Cancelar'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
