import React, { useState, useEffect } from 'react';
import { Scissors, UserCheck, User, Phone, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { crearCita, getBarberos } from '../services/api';
import { toast } from 'react-toastify';

const SERVICIOS = [
  { id: 1, nombre: 'Corte de Cabello Clásico', duracion: '30 minutos', precio: 35 },
  { id: 2, nombre: 'Barba Premium + Toalla Caliente', duracion: '25 minutos', precio: 25 },
  { id: 3, nombre: 'Combo: Corte + Barba + Exfoliación', duracion: '50 minutos', precio: 55 },
];

export default function BookingForm({ onCitaCreada }) {
  const [servicioSel, setServicioSel] = useState(SERVICIOS[0]);

  const [barberos, setBarberos] = useState([]);
  const [barberoSel, setBarberoSel] = useState(null);
  const [cargandoBarberos, setCargandoBarberos] = useState(true);

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [exito, setExito] = useState(false);

  // Estados que faltaban:
  const [error, setError] = useState(null);
  const [cargandoEnvio, setCargandoEnvio] = useState(false);

  useEffect(() => {
    const cargarBarberos = async () => {
      try {
        const res = await getBarberos();
        const listaBD = res.data;
        setBarberos(listaBD);
        setBarberoSel(listaBD[0] || null); // ya no hay opción "id: 0"
      } catch (err) {
        console.error("Error al obtener la lista de barberos:", err);
        setBarberos([]);
        setBarberoSel(null);
      } finally {
        setCargandoBarberos(false);
      }
    };

    cargarBarberos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!nombre || !telefono || !servicioSel || !barberoSel || !fecha || !hora) {
      setError("Por favor, completa todos los campos obligatorios.");
      return;
    }

    setCargandoEnvio(true);

    const nuevaCita = {
      clienteNombre: nombre,
      clienteTelefono: telefono,
      servicioId: servicioSel.id,
      barberoId: barberoSel.id,
      fecha: `${fecha}T${hora.length === 5 ? hora + ":00" : hora}`,
    };

    try {
      await crearCita(nuevaCita);
      toast.success("¡Cita reservada con éxito!");
      setExito(true);

      setTimeout(() => {
        if (onCitaCreada) onCitaCreada();
      }, 1500);

    } catch (err) {
      console.error("Detalle del error:", err);

      let mensaje;
      if (err.response) {
        mensaje = err.response.data?.message || "No se pudo procesar la reserva. Verifica los datos ingresados.";
      } else if (err.request) {
        mensaje = "No se pudo conectar con el servidor. Intenta nuevamente en unos minutos.";
      } else {
        mensaje = "Ocurrió un error inesperado. Intenta nuevamente.";
      }
      setError(mensaje);
      toast.error(mensaje);
    } finally {
      setCargandoEnvio(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-8 bg-[#151C2C] border border-gray-800 rounded-3xl p-8 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded-2xl">
          <Scissors className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Reserva tu Cita</h2>
          <p className="text-xs text-gray-400">Selecciona el servicio, tu barbero y tu horario preferido</p>
        </div>
      </div>

      {exito && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>¡Reserva registrada con éxito! Redirigiendo...</span>
        </div>
      )}

      {error && !exito && (
        <div className="mb-6 p-4 bg-red-950/40 border border-red-900 rounded-2xl text-red-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            1. Selecciona el Servicio
          </label>
          <div className="space-y-2">
            {SERVICIOS.map((s) => (
              <div
                key={s.id}
                onClick={() => setServicioSel(s)}
                className={`p-4 rounded-xl border cursor-pointer transition flex justify-between items-center ${
                  servicioSel.id === s.id
                    ? 'border-yellow-500 bg-yellow-500/5'
                    : 'border-gray-800 bg-[#0B0F17] hover:border-gray-700'
                }`}
              >
                <div>
                  <p className="font-semibold text-white text-sm">{s.nombre}</p>
                  <p className="text-xs text-gray-500">{s.duracion}</p>
                </div>
                <span className="text-yellow-500 font-bold text-base">S/ {s.precio}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            2. Selecciona tu Barbero
          </label>

          {cargandoBarberos ? (
            <div className="flex items-center justify-center p-6 text-gray-500 gap-2 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
              <span>Cargando barberos disponibles...</span>
            </div>
          ) : barberos.length === 0 ? (
            <p className="text-xs text-gray-500 p-3">No hay barberos disponibles en este momento.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {barberos.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setBarberoSel(b)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                    barberoSel?.id === b.id
                      ? 'border-yellow-500 bg-yellow-500/5'
                      : 'border-gray-800 bg-[#0B0F17] hover:border-gray-700'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${barberoSel?.id === b.id ? 'text-yellow-500 bg-yellow-500/10' : 'text-gray-400 bg-gray-800/50'}`}>
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-xs">{b.nombre}</p>
                    <p className="text-[10px] text-gray-500">{b.especialidad || 'Barbero Profesional'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 pt-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
            3. Tus Datos Personales
          </label>

          <div>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3.5 text-gray-500" />
              <input
                type="text"
                required
                placeholder="Nombre Completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-[#0B0F17] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3.5 text-gray-500" />
              <input
                type="tel"
                required
                placeholder="Teléfono / WhatsApp"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-[#0B0F17] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Fecha</label>
            <input
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#0B0F17] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-yellow-500 [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Hora</label>
            <input
              type="time"
              required
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#0B0F17] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-yellow-500 [color-scheme:dark]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={cargandoEnvio}
          className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold rounded-xl text-sm transition shadow-lg shadow-yellow-500/10 mt-4"
        >
          {cargandoEnvio ? 'Enviando...' : 'Confirmar Reserva'}
        </button>
      </form>
    </div>
  );
}