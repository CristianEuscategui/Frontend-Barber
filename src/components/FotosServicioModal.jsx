import React from 'react';
import { X, Check, Scissors } from 'lucide-react';

// Catálogo de fotos referenciales mapeadas por palabras clave del servicio
const GALERIA_FOTOS = {
  fade: [
    { id: 'f1', titulo: 'Mid Fade + Texture', fotoUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&auto=format&fit=crop&q=60' },
    { id: 'f2', titulo: 'Low Fade Clásico', fotoUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&auto=format&fit=crop&q=60' },
    { id: 'f3', titulo: 'High Fade Skin', fotoUrl: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=500&auto=format&fit=crop&q=60' },
  ],
  barba: [
    { id: 'b1', titulo: 'Perfilado de Barba Premium', fotoUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&auto=format&fit=crop&q=60' },
    { id: 'b2', titulo: 'Barba Completa + Toalla Caliente', fotoUrl: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=500&auto=format&fit=crop&q=60' },
  ],
  clasico: [
    { id: 'c1', titulo: 'Corte Ejecutivo / Peinado Tradicional', fotoUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&auto=format&fit=crop&q=60' },
    { id: 'c2', titulo: 'Corte Tijera Clásico', fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60' },
  ]
};

export default function FotosServicioModal({ servicio, isOpen, onClose, corteSeleccionado, onSeleccionarCorte }) {
  if (!isOpen || !servicio) return null;

  // Buscar fotos asociadas al servicio según su nombre
  const nombreLower = servicio.nombre.toLowerCase();
  let fotos = GALERIA_FOTOS.fade; // Por defecto

  if (nombreLower.includes('barba')) {
    fotos = GALERIA_FOTOS.barba;
  } else if (nombreLower.includes('clasico') || nombreLower.includes('clásico')) {
    fotos = GALERIA_FOTOS.clasico;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#151C2C] border border-gray-800 w-full max-w-2xl rounded-3xl p-6 relative shadow-2xl space-y-4">
        {/* Botón Cerrar */}
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="text-[10px] uppercase font-bold text-yellow-500 tracking-wider">Catálogo de Ejemplos</span>
          <h3 className="text-xl font-bold text-white">{servicio.nombre}</h3>
          <p className="text-xs text-gray-400 mt-0.5">Elige una referencia de corte para tu reserva</p>
        </div>

        {/* Cuadrícula de fotos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-1">
          {fotos.map((item) => {
            const isSelected = corteSeleccionado?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => {
                  onSeleccionarCorte(item);
                  onClose();
                }}
                className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all ${
                  isSelected ? 'border-yellow-500 ring-2 ring-yellow-500/50' : 'border-gray-800 hover:border-gray-600'
                }`}
              >
                <img
                  src={item.fotoUrl}
                  alt={item.titulo}
                  className="w-full h-40 object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3">
                  <p className="text-xs font-bold text-white mb-2">{item.titulo}</p>
                  <button
                    type="button"
                    className={`w-full py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                      isSelected ? 'bg-yellow-500 text-zinc-950' : 'bg-black/60 text-white backdrop-blur group-hover:bg-yellow-500 group-hover:text-zinc-950'
                    }`}
                  >
                    {isSelected ? <><Check className="w-3.5 h-3.5" /> Seleccionado</> : <><Scissors className="w-3.5 h-3.5" /> Elegir este</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}