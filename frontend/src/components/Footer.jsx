import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-indigo-600 rounded-lg p-1.5">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 7h-1V6a4 4 0 0 0-8 0v1H9a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Zm-7-1a2 2 0 0 1 4 0v1h-4V6Zm7 14H9V9h1v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h1v11Z"/>
                </svg>
              </div>
              <span className="text-white text-xl font-bold">StayHub</span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs">
              Encuentra y reserva los mejores hoteles en Bucaramanga y toda Colombia.
              Las mejores tarifas garantizadas, sin costos ocultos.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.83 9.83 0 01-2.828.775 4.932 4.932 0 002.165-2.724c-.951.555-2.005.959-3.127 1.184a4.916 4.916 0 00-8.384 4.482C7.691 8.094 4.066 6.13 1.64 3.161a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.061a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z"/></svg>
              </a>
              <a href="#" className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0z"/></svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Explorar</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/search?city=Bucaramanga" className="hover:text-white transition-colors">Hoteles en Bucaramanga</Link></li>
              <li><Link to="/search?stars=5" className="hover:text-white transition-colors">Hoteles 5 estrellas</Link></li>
              <li><Link to="/search?stars=4" className="hover:text-white transition-colors">Hoteles 4 estrellas</Link></li>
              <li><Link to="/search?sort=price_asc" className="hover:text-white transition-colors">Ofertas especiales</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Ayuda</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white transition-colors">Iniciar sesión</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Crear cuenta</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Mis reservas</Link></li>
              <li><a href="mailto:soporte@stayhub.co" className="hover:text-white transition-colors">Soporte</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} StayHub Colombia. Todos los derechos reservados.
          </p>
          <p className="text-sm text-gray-500">
            Bucaramanga, Santander, Colombia
          </p>
        </div>
      </div>
    </footer>
  );
}
