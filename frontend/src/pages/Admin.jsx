import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import { formatDate } from '../utils/dateFormat';
import AlertModal from '../components/AlertModal';

function formatPrice(price) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);
}

function StatusBadge({ status }) {
  const config = {
    confirmed: { label: 'Confirmada', cls: 'bg-green-100 text-green-700' },
    pending: { label: 'Pendiente', cls: 'bg-yellow-100 text-yellow-700' },
    cancelled: { label: 'Cancelada', cls: 'bg-red-100 text-red-700' }
  };
  const s = config[status] || { label: status, cls: 'bg-gray-100 text-gray-700' };
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>;
}

// Modal component
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// Hotel Form
function HotelForm({ hotel, onSave, onClose }) {
  const [form, setForm] = useState({
    name: hotel?.name || '',
    description: hotel?.description || '',
    address: hotel?.address || '',
    neighborhood: hotel?.neighborhood || '',
    city: hotel?.city || 'Bucaramanga',
    stars: hotel?.stars || 3,
    rating: hotel?.rating || 0,
    review_count: hotel?.review_count || 0,
    price_from: hotel?.price_from || '',
    image_url: hotel?.image_url || '',
    amenities: hotel?.amenities || '',
    is_active: hotel?.is_active !== undefined ? hotel.is_active : 1
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : e.target.value;
    setForm(prev => ({ ...prev, [e.target.name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input name="name" value={form.name} onChange={handleChange} required className="w-full input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
          <input name="city" value={form.city} onChange={handleChange} required className="w-full input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Barrio/Sector</label>
          <input name="neighborhood" value={form.neighborhood} onChange={handleChange} className="w-full input-field" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
          <input name="address" value={form.address} onChange={handleChange} className="w-full input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estrellas *</label>
          <select name="stars" value={form.stars} onChange={handleChange} required className="w-full input-field">
            {[1,2,3,4,5].map(s => <option key={s} value={s}>{s} estrella{s !== 1 ? 's' : ''}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio desde (COP) *</label>
          <input type="number" name="price_from" value={form.price_from} onChange={handleChange} required className="w-full input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Calificación (0-10)</label>
          <input type="number" name="rating" value={form.rating} onChange={handleChange} min="0" max="10" step="0.1" className="w-full input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número de reseñas</label>
          <input type="number" name="review_count" value={form.review_count} onChange={handleChange} className="w-full input-field" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">URL de imagen</label>
          <input name="image_url" value={form.image_url} onChange={handleChange} className="w-full input-field" placeholder="https://..." />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Amenidades (separadas por coma)</label>
          <input name="amenities" value={form.amenities} onChange={handleChange} className="w-full input-field" placeholder="WiFi,Piscina,Restaurante..." />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full input-field resize-none" />
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <input type="checkbox" name="is_active" id="hotel_active" checked={!!form.is_active} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded" />
          <label htmlFor="hotel_active" className="text-sm text-gray-700">Hotel activo</label>
        </div>
      </div>
      {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="flex-1 btn-primary">
          {saving ? 'Guardando...' : 'Guardar hotel'}
        </button>
        <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancelar</button>
      </div>
    </form>
  );
}

// Room Form
function RoomForm({ room, hotels, onSave, onClose }) {
  const [form, setForm] = useState({
    hotel_id: room?.hotel_id || (hotels[0]?.id || ''),
    name: room?.name || '',
    type: room?.type || 'double',
    capacity: room?.capacity || 2,
    price_per_night: room?.price_per_night || '',
    description: room?.description || '',
    image_url: room?.image_url || '',
    is_available: room?.is_available !== undefined ? room.is_available : 1
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : e.target.value;
    setForm(prev => ({ ...prev, [e.target.name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Hotel *</label>
          <select name="hotel_id" value={form.hotel_id} onChange={handleChange} required className="w-full input-field">
            {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de habitación *</label>
          <input name="name" value={form.name} onChange={handleChange} required className="w-full input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
          <select name="type" value={form.type} onChange={handleChange} required className="w-full input-field">
            <option value="single">Individual</option>
            <option value="double">Doble</option>
            <option value="suite">Suite</option>
            <option value="deluxe">Deluxe</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad *</label>
          <input type="number" name="capacity" value={form.capacity} onChange={handleChange} min="1" max="10" required className="w-full input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio por noche (COP) *</label>
          <input type="number" name="price_per_night" value={form.price_per_night} onChange={handleChange} required className="w-full input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL de imagen</label>
          <input name="image_url" value={form.image_url} onChange={handleChange} className="w-full input-field" placeholder="https://..." />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="w-full input-field resize-none" />
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <input type="checkbox" name="is_available" id="room_avail" checked={!!form.is_available} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded" />
          <label htmlFor="room_avail" className="text-sm text-gray-700">Habitación disponible</label>
        </div>
      </div>
      {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="flex-1 btn-primary">
          {saving ? 'Guardando...' : 'Guardar habitación'}
        </button>
        <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancelar</button>
      </div>
    </form>
  );
}

export default function Admin() {
  const [tab, setTab] = useState('hotels');
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { type: 'hotel'|'room', item: null|{} }
  const [deleting, setDeleting] = useState(null);
  const [alertModal, setAlertModal] = useState(null);

  const showAlert = (config) => setAlertModal(config);
  const closeAlert = () => setAlertModal(null);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [h, r, b] = await Promise.all([
          adminApi.getHotels(),
          adminApi.getRooms(),
          adminApi.getBookings()
        ]);
        setHotels(h.data);
        setRooms(r.data);
        setBookings(b.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const refreshHotels = () => adminApi.getHotels().then(r => setHotels(r.data));
  const refreshRooms = () => adminApi.getRooms().then(r => setRooms(r.data));
  const refreshBookings = () => adminApi.getBookings().then(r => setBookings(r.data));

  const handleSaveHotel = async (form) => {
    const isEdit = !!modal.item;
    if (isEdit) {
      await adminApi.updateHotel(modal.item.id, form);
    } else {
      await adminApi.createHotel(form);
    }
    await refreshHotels();
    showAlert({
      type: 'success',
      title: isEdit ? 'Hotel actualizado' : 'Hotel creado',
      message: isEdit ? 'El hotel ha sido actualizado exitosamente.' : 'El hotel ha sido creado exitosamente.',
      onConfirm: closeAlert,
    });
  };

  const handleDeleteHotel = (id) => {
    showAlert({
      type: 'confirm',
      title: '¿Desactivar hotel?',
      message: 'El hotel quedará inactivo y no aparecerá en las búsquedas.',
      onConfirm: async () => {
        closeAlert();
        setDeleting(id);
        await adminApi.deleteHotel(id);
        await refreshHotels();
        setDeleting(null);
        showAlert({
          type: 'success',
          title: 'Hotel eliminado',
          message: 'El hotel ha sido desactivado exitosamente.',
          onConfirm: closeAlert,
        });
      },
      onCancel: closeAlert,
    });
  };

  const handleSaveRoom = async (form) => {
    const isEdit = !!modal.item;
    if (isEdit) {
      await adminApi.updateRoom(modal.item.id, form);
    } else {
      await adminApi.createRoom(form);
    }
    await refreshRooms();
    showAlert({
      type: 'success',
      title: isEdit ? 'Habitación actualizada' : 'Habitación creada',
      message: isEdit ? 'La habitación ha sido actualizada exitosamente.' : 'La habitación ha sido creada exitosamente.',
      onConfirm: closeAlert,
    });
  };

  const handleDeleteRoom = (id) => {
    showAlert({
      type: 'confirm',
      title: '¿Desactivar habitación?',
      message: 'La habitación quedará no disponible para reservas.',
      onConfirm: async () => {
        closeAlert();
        setDeleting(id);
        await adminApi.deleteRoom(id);
        await refreshRooms();
        setDeleting(null);
        showAlert({
          type: 'success',
          title: 'Habitación eliminada',
          message: 'La habitación ha sido desactivada exitosamente.',
          onConfirm: closeAlert,
        });
      },
      onCancel: closeAlert,
    });
  };

  const handleBookingStatus = async (id, status) => {
    await adminApi.updateBookingStatus(id, status);
    await refreshBookings();
  };

  const tabs = [
    { key: 'hotels', label: `Hoteles (${hotels.length})` },
    { key: 'rooms', label: `Habitaciones (${rooms.length})` },
    { key: 'bookings', label: `Reservas (${bookings.length})` }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-indigo-800 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">Panel de Administración</h1>
          <p className="text-indigo-200 mt-1">Gestiona hoteles, habitaciones y reservas</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 pb-0">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2.5 font-semibold text-sm rounded-t-xl transition-colors border-b-2 -mb-px ${
                tab === t.key
                  ? 'border-indigo-600 text-indigo-700 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          </div>
        ) : (
          <>
            {/* HOTELS TAB */}
            {tab === 'hotels' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800">Gestión de Hoteles</h2>
                  <button onClick={() => setModal({ type: 'hotel', item: null })} className="btn-primary flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo hotel
                  </button>
                </div>
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Hotel</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Ciudad</th>
                          <th className="text-center px-4 py-3 font-semibold text-gray-600">Estrellas</th>
                          <th className="text-right px-4 py-3 font-semibold text-gray-600">Precio desde</th>
                          <th className="text-center px-4 py-3 font-semibold text-gray-600">Estado</th>
                          <th className="text-right px-4 py-3 font-semibold text-gray-600">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {hotels.map(hotel => (
                          <tr key={hotel.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={hotel.image_url}
                                  alt={hotel.name}
                                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&q=80'; }}
                                />
                                <div>
                                  <p className="font-semibold text-gray-800">{hotel.name}</p>
                                  <p className="text-xs text-gray-400">{hotel.neighborhood}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{hotel.city}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex justify-center">
                                {Array.from({ length: hotel.stars }).map((_, i) => (
                                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-gray-800">{formatPrice(hotel.price_from)}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${hotel.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {hotel.is_active ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setModal({ type: 'hotel', item: hotel })}
                                  className="text-indigo-600 hover:text-indigo-800 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteHotel(hotel.id)}
                                  disabled={deleting === hotel.id}
                                  className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ROOMS TAB */}
            {tab === 'rooms' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800">Gestión de Habitaciones</h2>
                  <button onClick={() => setModal({ type: 'room', item: null })} className="btn-primary flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva habitación
                  </button>
                </div>
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Habitación</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Hotel</th>
                          <th className="text-center px-4 py-3 font-semibold text-gray-600">Tipo</th>
                          <th className="text-center px-4 py-3 font-semibold text-gray-600">Capacidad</th>
                          <th className="text-right px-4 py-3 font-semibold text-gray-600">Precio/noche</th>
                          <th className="text-center px-4 py-3 font-semibold text-gray-600">Estado</th>
                          <th className="text-right px-4 py-3 font-semibold text-gray-600">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {rooms.map(room => (
                          <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-800">{room.name}</td>
                            <td className="px-4 py-3 text-gray-600 text-xs">{room.hotel_name}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium capitalize">
                                {room.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-gray-600">{room.capacity}</td>
                            <td className="px-4 py-3 text-right font-medium text-gray-800">{formatPrice(room.price_per_night)}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${room.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {room.is_available ? 'Disponible' : 'No disponible'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setModal({ type: 'room', item: room })}
                                  className="text-indigo-600 hover:text-indigo-800 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteRoom(room.id)}
                                  disabled={deleting === room.id}
                                  className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* BOOKINGS TAB */}
            {tab === 'bookings' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800">Gestión de Reservas</h2>
                  <div className="text-sm text-gray-500">
                    Total: {bookings.length} reservas
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Huésped</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Hotel / Habitación</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Fechas</th>
                          <th className="text-right px-4 py-3 font-semibold text-gray-600">Total</th>
                          <th className="text-center px-4 py-3 font-semibold text-gray-600">Estado</th>
                          <th className="text-right px-4 py-3 font-semibold text-gray-600">Cambiar estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {bookings.map(b => (
                          <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-gray-400 text-xs">#{b.id}</td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-800">{b.guest_name}</p>
                              <p className="text-xs text-gray-400">{b.guest_email}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-800 text-xs">{b.hotel_name}</p>
                              <p className="text-xs text-gray-400">{b.room_name}</p>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600">
                              {formatDate(b.check_in)} → {formatDate(b.check_out)}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatPrice(b.total_price)}</td>
                            <td className="px-4 py-3 text-center"><StatusBadge status={b.status} /></td>
                            <td className="px-4 py-3 text-right">
                              <select
                                value={b.status}
                                onChange={e => handleBookingStatus(b.id, e.target.value)}
                                className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="pending">Pendiente</option>
                                <option value="confirmed">Confirmada</option>
                                <option value="cancelled">Cancelada</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Alert Modal */}
      {alertModal && (
        <AlertModal
          type={alertModal.type}
          title={alertModal.title}
          message={alertModal.message}
          onConfirm={alertModal.onConfirm}
          onCancel={alertModal.onCancel}
        />
      )}

      {/* Modal */}
      {modal && (
        <Modal
          title={modal.type === 'hotel'
            ? (modal.item ? 'Editar hotel' : 'Nuevo hotel')
            : (modal.item ? 'Editar habitación' : 'Nueva habitación')
          }
          onClose={() => setModal(null)}
        >
          {modal.type === 'hotel' ? (
            <HotelForm hotel={modal.item} onSave={handleSaveHotel} onClose={() => setModal(null)} />
          ) : (
            <RoomForm room={modal.item} hotels={hotels} onSave={handleSaveRoom} onClose={() => setModal(null)} />
          )}
        </Modal>
      )}
    </div>
  );
}
