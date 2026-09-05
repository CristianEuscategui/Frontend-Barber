import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Scissors, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { crearResena } from '../services/api';

export default function PaginaResena() {
  const { citaId } = useParams();
  const navigate = useNavigate();

  const [estrellas, setEstrellas] = useState(0);
  const [hoverEstrella, setHoverEstrella] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (estrellas === 0) {
      setError('Por favor selecciona una calificación de estrellas.');
      return;
    }

    setEnviando(true);
    try {
      await crearResena({
        citaId: Number(citaId),
        estrellas,
        comentario,
      });
      setExito(true);
    } catch (err) {
      console.error('Error al enviar reseña:', err);
      const mensaje = err.response?.data?.message || 'No se pudo enviar tu reseña. Inténtalo nuevamente.';
      setError(mensaje);
    } finally {
      setEnviando(false);
    }
  };

  if (exito) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-[#151C2C] border border-emerald-500/30 rounded-3xl shadow-2xl text-center space-y-4">
        <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">¡Gracias por tu reseña!</h2>
        <p className="text-sm text-gray-400">Tu opinión nos ayuda a mejorar y a que más personas confíen en nosotros.</p>
        <button
          onClick={() => navigate('/')}
          className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 font-bold rounded-xl text-sm transition mt-2"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-[#151C2C] border border-gray-800 rounded-3xl shadow-2xl">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-3">
          <Scissors className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">¿Cómo fue tu experiencia?</h2>
        <p className="text-xs text-gray-400 mt-1">Tu opinión es muy importante para nosotros</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="text-center">
          <label className="block text-xs font-medium text-gray-400 mb-3">Calificación</label>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setEstrellas(n)}
                onMouseEnter={() => setHoverEstrella(n)}
                onMouseLeave={() => setHoverEstrella(0)}
                className="transition transform hover:scale-110"
              >
                <Star
                  className={`w-9 h-9 ${
                    n <= (hoverEstrella || estrellas)
                      ? 'fill-yellow-500 text-yellow-500'
                      : 'text-gray-700'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Cuéntanos más (opcional)</label>
          <textarea
            rows={4}
            placeholder="¿Qué te pareció el servicio?"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="w-full px-3 py-2 bg-[#0B0F17] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2"
        >
          {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {enviando ? 'Enviando...' : 'Enviar reseña'}
        </button>
      </form>
    </div>
  );
}