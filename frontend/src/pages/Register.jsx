import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_COUNTRY } from '../utils/phoneCodes';
import {
  onlyDigits,
  validatePassword,
  validatePasswordMatch,
  passwordStrength,
} from '../utils/validations';
import PhoneCountrySelect from '../components/PhoneCountrySelect';
import AlertModal from '../components/AlertModal';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', phone: '' });
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePhoneChange = (e) => {
    setForm(prev => ({ ...prev, phone: onlyDigits(e.target.value) }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const passwordError = validatePassword(form.password);
    if (passwordError) return setError(passwordError);

    const matchError = validatePasswordMatch(form.password, form.confirm);
    if (matchError) return setError(matchError);

    const fullPhone = form.phone ? `${country.dialCode}${form.phone}` : '';

    setLoading(true);
    try {
      await register(form.name, form.email, form.password, fullPhone);
      setShowSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength(form.password);

  return (
    <>
    {showSuccess && (
      <AlertModal
        type="success"
        title="¡Cuenta creada!"
        message={`Bienvenido, ${form.name.split(' ')[0]}. Tu cuenta ha sido creada exitosamente.`}
        onConfirm={() => navigate('/', { replace: true })}
      />
    )}
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-indigo-700">
            <div className="bg-indigo-700 rounded-xl p-2">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 7h-1V6a4 4 0 0 0-8 0v1H9a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/>
              </svg>
            </div>
            StayHub
          </Link>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Crea tu cuenta</h2>
          <p className="text-gray-500 text-sm mt-1">Únete y empieza a reservar en segundos</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
              <input
                id="reg-name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                autoComplete="name"
                className="input-field"
                placeholder="Juan Carlos Pérez"
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
              <input
                id="reg-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="input-field"
                placeholder="tu@correo.com"
              />
            </div>

            {/* Teléfono con selector de país */}
            <div>
              <label htmlFor="reg-phone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <div className="flex focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-0 rounded-lg">
                <PhoneCountrySelect value={country} onChange={setCountry} />
                <input
                  id="reg-phone"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handlePhoneChange}
                  autoComplete="tel"
                  inputMode="numeric"
                  className="flex-1 min-w-0 border border-l-0 border-gray-300 rounded-r-lg px-3 py-2 text-sm focus:outline-none"
                  placeholder="300 123 4567"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className="input-field pr-10"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              {strength && (
                <div className="mt-1.5">
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Contraseña {strength.label}</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="reg-confirm" className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña *</label>
              <input
                id="reg-confirm"
                type={showPassword ? 'text' : 'password'}
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className={`input-field ${form.confirm && form.password !== form.confirm ? 'border-red-400 focus:ring-red-500' : ''}`}
                placeholder="Repite tu contraseña"
              />
              {form.confirm && form.password !== form.confirm && (
                <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creando cuenta...
                </span>
              ) : 'Crear cuenta gratis'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
