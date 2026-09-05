import React, { useState, useEffect } from 'react';
import { X, Star, User, Loader2, Trash2 } from 'lucide-react';
import { getResenasPorBarbero, eliminarResena } from '../services/api';
import { toast } from 'react-toastify';

export default function ResenasModal({ barbero, isOpen, onClose, modoAdmin = false }) {
  const [resenas, setResenas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarResenas = () => {
    if (barbero?.id) {
      setCargando(true);
      getResenasPorBarbero(barbero.id)
        .then((res) => setResenas(res.data || []))
        .catch((err) => {
          console.error("Error al cargar reseñas:", err);
          setResenas([]);
        })
        .finally(() => setCargando(false));
    }
  };

  useEffect(() => {
    if (isOpen && barbero?.id) {
      cargarResenas();
    }
  }, [isOpen, barbero?.id]);

  if (!isOpen || !barbero) return null;

  const calificacionPromedio = resenas.length > 0
    ? (resenas.reduce((acc, r) => acc + r.estrellas, 0) / resenas.length).toFixed(1)
    : null;

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta reseña? Esta acción no se puede deshacer.')) return;
    try {
      await eliminarResena(id);
      toast.success('Reseña eliminada correctamente.');
      cargarResenas();
    } catch (err) {
      console.error('Error al eliminar reseña:', err);
      toast.error('No se pudo eliminar la reseña.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#151C2C] border border-gray-800 w-full max-w-lg rounded-3xl p-6 relative shadow-2xl space-y-4">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 border-b border-gray-800/80 pb-4">
          <img
            src={barbero.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=60'}
            alt={barbero.nombre}
            className="w-14 h-14 rounded-full object-cover border-2 border-yellow-500"
          />
          <div>
            <h3 className="text-lg font-bold text-white">{barbero.nombre}</h3>
            <p className="text-xs text-yellow-500">{barbero.especialidad || 'Master Barber'}</p>
            <div className="flex items-center gap-1 text-xs text-amber-400 mt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="font-bold">{calificacionPromedio || 'Sin calificar'}</span>
              <span className="text-gray-500">({resenas.length} opiniones)</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Opiniones de clientes</h4>

          {cargando ? (
            <div className="flex items-center justify-center py-8 text-gray-500 gap-2 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
              <span>Cargando reseñas...</span>
            </div>
          ) : resenas.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-xs">
              Este barbero aún no tiene reseñas.
            </div>
          ) : (
            resenas.map((r) => (
              <div key={r.id} className="p-3 bg-[#0B0F17] border border-gray-800/60 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <User className="w-3 h-3 text-yellow-500" /> {r.clienteNombre}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-400">
                      {[...Array(r.estrellas)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                    {modoAdmin && (
                      <button
                        onClick={() => handleEliminar(r.id)}
                        title="Eliminar reseña"
                        className="p-1 text-rose-400 hover:text-rose-300 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                {r.comentario && (
                  <p className="text-xs text-gray-300 italic">"{r.comentario}"</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}