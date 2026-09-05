import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { actualizarBarbero, subirFotoBarbero } from '../services/api';

export default function EditarBarberoModal({ barbero, isOpen, onClose, onActualizado }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    especialidad: '',
    telefono: '',
    email: '',
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
const [archivoFoto, setArchivoFoto] = useState(null);

useEffect(() => {
  if (barbero) {
    setFormData({
      nombre: barbero.nombre || '',
      apellido: barbero.apellido || '',
      especialidad: barbero.especialidad || '',
      telefono: barbero.telefono || '',
      email: barbero.email || '',
    });
    setFotoUrl(barbero.fotoUrl || '');
    setArchivoFoto(null);
    setError('');
  }
}, [barbero]);

  if (!isOpen || !barbero) return null;

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setGuardando(true);
  try {
    await actualizarBarbero(barbero.id, {
      ...formData,
      fotoUrl: fotoUrl,
      activo: barbero.activo,
    });

    if (archivoFoto) {
      await subirFotoBarbero(barbero.id, archivoFoto);
    }

    toast.success('Barbero actualizado correctamente.');
    onActualizado();
    onClose();
  } catch (err) {
    console.error('Error al actualizar barbero:', err);
    const mensaje = err.response?.data?.message || 'No se pudo actualizar el barbero.';
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

        <h3 className="text-lg font-bold text-white mb-4">Editar Barbero</h3>

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
            <label className="block text-xs text-gray-400 mb-1">Apellido</label>
            <input
              type="text"
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              className="w-full px-3 py-2 bg-[#0B0F17] border border-gray-800 rounded-lg text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Especialidad</label>
            <input
              type="text"
              value={formData.especialidad}
              onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
              className="w-full px-3 py-2 bg-[#0B0F17] border border-gray-800 rounded-lg text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Teléfono</label>
            <input
              type="text"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="w-full px-3 py-2 bg-[#0B0F17] border border-gray-800 rounded-lg text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-[#0B0F17] border border-gray-800 rounded-lg text-sm text-white"
            />
          </div>
          <div>
  <label className="block text-xs text-gray-400 mb-1">URL de la Foto</label>
  <input
    type="url"
    value={fotoUrl}
    onChange={(e) => setFotoUrl(e.target.value)}
    className="w-full px-3 py-2 bg-[#0B0F17] border border-gray-800 rounded-lg text-sm text-white"
  />
</div>
<div>
  <label className="block text-xs text-gray-400 mb-1">
    O sube una foto nueva (tiene prioridad sobre la URL)
  </label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) => setArchivoFoto(e.target.files[0] || null)}
    className="w-full p-2 bg-[#0B0F17] border border-gray-800 rounded-lg text-xs text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-yellow-500 file:text-zinc-950 file:text-xs file:font-semibold file:cursor-pointer"
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