import React, { useState, useEffect } from 'react';
import { X, PlusCircle, AlertCircle } from 'lucide-react';
import { crearCita, getBarberos, getServicios } from '../services/api';
import { toast } from 'react-toastify';

export default function CitaModal({ isOpen, onClose, onCitaCreada }) {
  const [formData, setFormData] = useState({
    clienteNombre: '',
    clienteTelefono: '',
    barberoId: '',
    servicioId: '',
    fecha: '',
    hora: '',
  });
  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getBarberos().then(res => setBarberos(res.data)).catch(() => setBarberos([]));
      getServicios().then(res => setServicios(res.data)).catch(() => setServicios([]));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.barberoId) {
      setError('Selecciona un barbero para continuar.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
  clienteNombre: formData.clienteNombre,
  clienteTelefono: formData.clienteTelefono,
  barberoId: Number(formData.barberoId),
  servicioId: formData.servicioId ? Number(formData.servicioId) : null,
  fecha: formData.fecha,  // ya viene en "yyyy-MM-dd" desde el input type="date"
  hora: formData.hora,    // ya viene en "HH:mm" desde el input type="time"
};
      await crearCita(payload);
        toast.success("¡Cita registrada correctamente!"); // <- nueva línea
      onCitaCreada();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'No se pudo registrar la cita. Verifica los datos e inténtalo nuevamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#151C2C] border border-gray-800 w-full max-w-md rounded-2xl p-6 relative shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-yellow-500" /> Nueva Cita Manual
        </h3>

        {error && (
          <div className="mb-3 flex items-start gap-2 bg-red-950/40 border border-red-900 text-red-300 text-sm px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Cliente</label>
            <input
              type="text"
              required
              value={formData.clienteNombre}
              onChange={(e) => setFormData({ ...formData, clienteNombre: e.target.value })}
              className="w-full px-3 py-2 bg-[#0B0F17] border border-gray-800 rounded-lg text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Teléfono</label>
            <input
              type="tel"
              required
              value={formData.clienteTelefono}
              onChange={(e) => setFormData({ ...formData, clienteTelefono: e.target.value })}
              className="w-full px-3 py-2 bg-[#0B0F17] border border-gray-800 rounded-lg text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Barbero</label>
            <select
              required
              value={formData.barberoId}
              onChange={(e) => setFormData({ ...formData, barberoId: e.target.value })}
              className="w-full px-3 py-2 bg-[#0B0F17] border border-gray-800 rounded-lg text-sm text-white"
            >
              <option value="">Selecciona un barbero</option>
              {barberos.map((b) => (
                <option key={b.id} value={b.id}>{b.nombre} {b.apellido}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Servicio</label>
            <select
              value={formData.servicioId}
              onChange={(e) => setFormData({ ...formData, servicioId: e.target.value })}
              className="w-full px-3 py-2 bg-[#0B0F17] border border-gray-800 rounded-lg text-sm text-white"
            >
              <option value="">Sin servicio específico</option>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre} — S/{s.precio}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Fecha</label>
              <input
                type="date"
                required
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className="w-full px-3 py-2 bg-[#0B0F17] border border-gray-800 rounded-lg text-sm text-white [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Hora</label>
              <input
                type="time"
                required
                value={formData.hora}
                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                className="w-full px-3 py-2 bg-[#0B0F17] border border-gray-800 rounded-lg text-sm text-white [color-scheme:dark]"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold rounded-lg text-sm transition mt-4"
          >
            {loading ? 'Guardando...' : 'Guardar Cita'}
          </button>
        </form>
      </div>
    </div>
  );
}