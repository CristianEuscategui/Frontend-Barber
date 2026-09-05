import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

export default function FilaHorario({ dia, nombreDia, horario, onGuardar }) {
  const [abierto, setAbierto] = useState(horario.abierto);
  const [apertura, setApertura] = useState(horario.horaApertura?.slice(0, 5) || '10:00');
  const [cierre, setCierre] = useState(horario.horaCierre?.slice(0, 5) || '22:00');

  useEffect(() => {
    setAbierto(horario.abierto);
    setApertura(horario.horaApertura?.slice(0, 5) || '10:00');
    setCierre(horario.horaCierre?.slice(0, 5) || '22:00');
  }, [horario]);

  const handleGuardar = () => {
    onGuardar(dia, {
      diaSemana: dia,
      abierto,
      horaApertura: abierto ? apertura : null,
      horaCierre: abierto ? cierre : null,
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-[#0B0F17] border border-gray-800 rounded-xl">
      <div className="flex items-center gap-2 w-28">
        <input
          type="checkbox"
          checked={abierto}
          onChange={(e) => setAbierto(e.target.checked)}
          className="w-4 h-4 accent-yellow-500"
        />
        <span className="text-sm font-semibold text-white">{nombreDia}</span>
      </div>

      {abierto ? (
        <div className="flex items-center gap-2 flex-1">
          <input
            type="time"
            value={apertura}
            onChange={(e) => setApertura(e.target.value)}
            className="px-2 py-1.5 bg-[#151C2C] border border-gray-800 rounded-lg text-xs text-white [color-scheme:dark]"
          />
          <span className="text-gray-500 text-xs">a</span>
          <input
            type="time"
            value={cierre}
            onChange={(e) => setCierre(e.target.value)}
            className="px-2 py-1.5 bg-[#151C2C] border border-gray-800 rounded-lg text-xs text-white [color-scheme:dark]"
          />
        </div>
      ) : (
        <span className="flex-1 text-xs text-gray-500 italic">Cerrado este día</span>
      )}

      <button
        onClick={handleGuardar}
        className="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-lg transition"
        title="Guardar cambios de este día"
      >
        <Save className="w-4 h-4" />
      </button>
    </div>
  );
}