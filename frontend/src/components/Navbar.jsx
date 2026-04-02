import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="bg-indigo-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-white rounded-lg p-1.5">
              <svg className="w-6 h-6 text-indigo-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 7h-1V6a4 4 0 0 0-8 0v1H9a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Zm-7-1a2 2 0 0 1 4 0v1h-4V6Zm7 14H9V9h1v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h1v11Z"/>
              </svg>
            </div>
            <span className="text-white text-xl font-bold tracking-wide">StayHub</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/search?city=Bucaramanga" className="text-indigo-100 hover:text-white text-sm font-medium transition-colors">
              Explorar hoteles
            </Link>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-yellow-300 hover:text-yellow-100 text-sm font-medium transition-colors">
                    Panel Admin
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <div className="w-7 h-7 bg-white text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{user.name.split(' ')[0]}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-100">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                      >
                        Mis reservas
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                        >
                          Panel de administración
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-indigo-100 hover:text-white text-sm font-medium transition-colors">
                  Iniciar sesión
                </Link>
                <Link to="/register" className="bg-white text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-indigo-600">
            <Link to="/search?city=Bucaramanga" onClick={() => setMenuOpen(false)} className="block py-2 text-indigo-100 hover:text-white text-sm">
              Explorar hoteles
            </Link>
            {user ? (
              <>
                <div className="py-2 border-b border-indigo-600 mb-2">
                  <p className="text-white font-semibold">{user.name}</p>
                  <p className="text-indigo-300 text-xs">{user.email}</p>
                </div>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block py-2 text-indigo-100 hover:text-white text-sm">Mis reservas</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="block py-2 text-yellow-300 hover:text-yellow-100 text-sm">Panel Admin</Link>
                )}
                <button onClick={handleLogout} className="block py-2 text-red-300 hover:text-red-100 text-sm">Cerrar sesión</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block py-2 text-indigo-100 hover:text-white text-sm">Iniciar sesión</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="block py-2 text-white font-semibold text-sm">Registrarse</Link>
              </>
            )}
          </div>
        )}
      </div>

      {/* Overlay to close menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[-1]" onClick={() => setMenuOpen(false)} />
      )}
    </nav>
  );
}
