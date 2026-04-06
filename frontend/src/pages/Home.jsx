import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import HotelCard from '../components/HotelCard';
import { hotelsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: '🏷️', title: 'Mejor precio garantizado', desc: 'Sin costos ocultos, siempre el mejor precio disponible.' },
  { icon: '🔒', title: 'Reservas seguras', desc: 'Tu información está protegida con cifrado SSL.' },
  { icon: '⚡', title: 'Confirmación inmediata', desc: 'Recibe confirmación al instante por correo electrónico.' },
  { icon: '🎧', title: 'Soporte 24/7', desc: 'Nuestro equipo está disponible para ayudarte en todo momento.' }
];

const NEIGHBORHOODS = [
  { name: 'Cabecera del Llano', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', count: 2 },
  { name: 'Centro Histórico', img: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&q=80', count: 3 },
  { name: 'Cañaveral', img: 'https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=400&q=80', count: 1 },
  { name: 'Ruitoque Alto', img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80', count: 1 }
];

export default function Home() {
  const { user } = useAuth();
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hotelsApi.search({ city: 'Bucaramanga', sort: 'rating' })
      .then(res => setFeaturedHotels(res.data.slice(0, 4)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80"
            alt="Bucaramanga"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              Descubre los mejores hoteles en{' '}
              <span className="text-yellow-400">Bucaramanga</span>
            </h1>
            <p className="text-lg md:text-xl text-indigo-200 max-w-2xl mx-auto">
              Reserva con confianza. Los mejores precios, sin complicaciones.
            </p>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8">
            {[
              { n: '8+', label: 'Hoteles' },
              { n: '30+', label: 'Habitaciones' },
              { n: '4.500+', label: 'Reseñas' }
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{s.n}</div>
                <div className="text-sm text-indigo-200">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Search Bar */}
          <SearchBar />
        </div>
      </section>

      {/* Neighborhoods */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Explora por sector</h2>
        <p className="text-gray-500 mb-6">Los barrios más populares de Bucaramanga</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {NEIGHBORHOODS.map(n => (
            <Link
              key={n.name}
              to={`/search?city=${encodeURIComponent(n.name)}`}
              className="relative rounded-xl overflow-hidden group h-36 cursor-pointer"
            >
              <img src={n.img} alt={n.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white font-semibold text-sm">{n.name}</p>
                <p className="text-gray-300 text-xs">{n.count} {n.count === 1 ? 'hotel' : 'hoteles'}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Hoteles destacados</h2>
            <p className="text-gray-500">Los favoritos de nuestros huéspedes</p>
          </div>
          <Link to="/search?city=Bucaramanga" className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm">
            Ver todos →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-md h-48 animate-pulse">
                <div className="flex h-full">
                  <div className="w-72 bg-gray-200 rounded-l-xl" />
                  <div className="flex-1 p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {featuredHotels.map(hotel => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="bg-indigo-50 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-800">¿Por qué elegir StayHub?</h2>
            <p className="text-gray-500 mt-2">Millones de viajeros confían en nosotros</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm text-center hover:shadow-md transition-shadow">
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      {!user &&
        <section className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white py-14">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-3">¿Listo para tu próxima aventura?</h2>
            <p className="text-indigo-200 mb-7 text-lg">Crea tu cuenta y gestiona todas tus reservas en un solo lugar.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register" className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-3 px-8 rounded-xl transition-colors">
                Crear cuenta gratis
              </Link>
              <Link to="/search?city=Bucaramanga" className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-xl border border-white/30 transition-colors">
                Explorar hoteles
              </Link>
            </div>
          </div>
        </section>
      }
    </div>
  );
}
