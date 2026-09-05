import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { actualizarServicio } from '../services/api';
import { toast } from 'react-toastify';

export default function EditarServicioModal({ servicio, isOpen, onClose, onActualizado }) {
  const [formData, setFormData] = useState({ nombre: '', precio: '', duracionMinutos: '' });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (servicio) {
      setFormData({
        nombre: servicio.nombre || '',
        precio: servicio.precio || '',
        duracionMinutos: servicio.duracionMinutos || '',
      });
      setError('');
    }
  }, [servicio]);

  if (!isOpen || !servicio) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      await actualizarServicio(servicio.id, {
        nombre: formData.nombre,
        precio: Number(formData.precio),
        duracionMinutos: Number(formData.duracionMinutos),
      });
      toast.success('Servicio actualizado correctamente.');
      onActualizado();
      onClose();
    } catch (err) {
      console.error('Error al actualizar servicio:', err);
      const mensaje = err.response?.data?.message || 'No se pudo actualizar el servicio.';
      setError(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#151C2C] border border-gray-800 w-full max-w-md rounded-2xl p-6 relative shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-4">Editar Servicio</h3>

        {error && (
          <div className="mb-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Nombre</label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-3 py-2 bg-[#0B0F17] border border-gray-800 rounded-lg text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Precio (S/)</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.precio}
              onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
              className="w-full px-3 py-2 bg-[#0B0F17] border border-gray-800 rounded-lg text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Duración (minutos)</label>
            <input
              type="number"
              required
              value={formData.duracionMinutos}
              onChange={(e) => setFormData({ ...formData, duracionMinutos: e.target.value })}
              className="w-full px-3 py-2 bg-[#0B0F17] border border-gray-800 rounded-lg text-sm text-white"
            />
          </div>

          <button
            type="submit"
            disabled={guardando}
            className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold rounded-lg text-sm transition mt-4 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {guardando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}