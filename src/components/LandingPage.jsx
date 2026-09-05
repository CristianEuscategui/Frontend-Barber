import React, { useState, useEffect } from 'react';
import { Scissors, Star, Clock, ArrowRight, CheckCircle2, MessageSquare, Loader2, Image, X, RotateCcw, AlertCircle } from 'lucide-react';
import { getBarberos, getServicios, crearCita, resolverUrlImagen, getLinkNotificacionBarbero } from '../services/api';
import ResenasModal from './ResenasModal';
import FotosServicioModal from './FotosServicioModal';

export default function LandingPage() {
  const [serviciosBD, setServiciosBD] = useState([]);
  const [barberosBD, setBarberosBD] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Modales
  const [barberoSeleccionadoResena, setBarberoSeleccionadoResena] = useState(null);
  const [servicioModalFotos, setServicioModalFotos] = useState(null);
  const [corteReferencia, setCorteReferencia] = useState(null);

  // Formulario & Key de Reinicio (Usando IDs primitivos)
  const [formKey, setFormKey] = useState(0);
  const [servicioIdSel, setServicioIdSel] = useState('');
  const [barberoIdSel, setBarberoIdSel] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const cargarDatosBD = async () => {
      try {
        const [resServicios, resBarberos] = await Promise.all([
          getServicios().catch(() => ({ data: [] })),
          getBarberos().catch(() => ({ data: [] }))
        ]);

        const serviciosData = resServicios.data.length > 0 ? resServicios.data : [
          { id: 1, nombre: 'Corte de Cabello Clásico', duracion: '30 min', precio: 35, descripcion: 'Corte tradicional o moderno con acabado a navaja.' },
          { id: 2, nombre: 'Barba Premium + Toalla Caliente', duracion: '25 min', precio: 25, descripcion: 'Perfilado de barba con aceites esenciales.' },
          { id: 3, nombre: 'Combo: Corte + Barba + Exfoliación', duracion: '50 min', precio: 55, descripcion: 'Paquete completo de corte e higiene facial.' },
        ];

        const barberosData = resBarberos.data.length > 0 ? resBarberos.data : [
          {
            id: 1,
            nombre: 'Carlos "El Máster"',
            especialidad: 'Especialista en Fades',
            fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=60',
            calificacion: 4.9,
            resenasCount: 42,
            resenas: [
              { cliente: "Mateo R.", comentario: "El mejor fade de Lima, muy detallista.", estrellas: 5 },
              { cliente: "Diego S.", comentario: "Atención rápida y muy buena vibra.", estrellas: 5 }
            ]
          },
          {
            id: 2,
            nombre: 'Luis Mendoza',
            especialidad: 'Diseño de Barbas & Tijera',
            fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=60',
            calificacion: 4.8,
            resenasCount: 31,
            resenas: [
              { cliente: "Jorge L.", comentario: "Buen perfilado de barba con toalla caliente.", estrellas: 5 }
            ]
          }
        ];

        setServiciosBD(serviciosData);
        setBarberosBD(barberosData);

        if (serviciosData.length > 0) setServicioIdSel(serviciosData[0].id);
        if (barberosData.length > 0) setBarberoIdSel(barberosData[0].id);

      } catch (err) {
        console.error("Error al conectar con la API:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarDatosBD();
  }, []);

  const scrollToReserva = (barbero = null) => {
    if (barbero) setBarberoIdSel(barbero.id);
    document.getElementById('reserva-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Limpia SOLO los campos del formulario (no toca los mensajes de éxito/error)
  const limpiarCamposFormulario = () => {
    setNombre('');
    setTelefono('');
    setFecha('');
    setHora('');
    setCorteReferencia(null);

    if (serviciosBD.length > 0) setServicioIdSel(serviciosBD[0].id);
    if (barberosBD.length > 0) setBarberoIdSel(barberosBD[0].id);

    setFormKey((prev) => prev + 1);
  };

  // Función del botón "Limpiar campos" (esta sí resetea todo, incluidos los mensajes)
  const limpiarFormulario = () => {
    limpiarCamposFormulario();
    setExito(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const servicioActual = serviciosBD.find(s => s.id === servicioIdSel) || serviciosBD[0];
    const barberoActual = barberosBD.find(b => b.id === barberoIdSel) || barberosBD[0];

    const notasFinal = corteReferencia
      ? `Estilo de referencia: ${corteReferencia.titulo}`
      : 'Reserva desde la web';

    const nuevaCita = {
      clienteNombre: nombre,
      clienteTelefono: telefono,
      barberoId: barberoActual?.id,
      servicioId: servicioActual?.id,
      fecha,   // formato "yyyy-MM-dd" desde el input type="date"
      hora,    // formato "HH:mm" desde el input type="time"
      notas: notasFinal
    };

    setEnviando(true);
    try {
      const res = await crearCita(nuevaCita);
      const citaCreada = res.data;

      // Notificar automáticamente al barbero por WhatsApp
      if (citaCreada?.id) {
        try {
          const linkNoti = await getLinkNotificacionBarbero(citaCreada.id);
          window.open(linkNoti.data, '_blank');
        } catch (errNoti) {
          console.error('No se pudo notificar al barbero:', errNoti);
          // no bloqueamos el flujo del cliente si esto falla
        }
      }

      limpiarCamposFormulario(); // limpia los campos, pero NO apaga "exito"
      setExito(true);            // ahora sí se queda visible
    } catch (err) {
      console.error("Error al agendar la cita:", err);
      const mensaje = err.response?.data?.message || "No se pudo agendar la cita. Verifica los datos e inténtalo nuevamente.";
      setError(mensaje);
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-yellow-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-xs text-gray-400">Cargando barbería...</p>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-12">
      {/* HERO SECTION */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-950 via-[#151C2C] to-zinc-950 border border-gray-800 p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-500 text-xs font-semibold">
            <Star className="w-3.5 h-3.5 fill-yellow-500" /> Sistema de Reservas Online
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Tu Estilo en Manos de <span className="text-yellow-500">Profesionales</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Selecciona a tu barbero preferido, revisa sus valoraciones reales y asegura tu cupo en segundos.
          </p>
          <button
            onClick={() => scrollToReserva()}
            className="px-6 py-3.5 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 font-bold rounded-xl text-sm transition flex items-center gap-2 shadow-lg shadow-yellow-500/10"
          >
            Agendar mi Cita <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="relative w-full md:w-1/2 h-64 md:h-80 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=60"
            alt="Barbería"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* SECCIÓN SERVICIOS */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-white">Servicios Disponibles</h2>
          <p className="text-xs text-gray-400">Selecciona el corte o paquete que buscas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {serviciosBD.map((s) => (
            <div key={s.id} className="p-5 bg-[#151C2C] border border-gray-800/80 rounded-2xl flex flex-col justify-between hover:border-yellow-500/40 transition">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2.5 bg-yellow-500/10 text-yellow-500 rounded-xl border border-yellow-500/20">
                    <Scissors className="w-5 h-5" />
                  </div>
                  <span className="text-xl font-bold text-yellow-500">S/ {s.precio}</span>
                </div>
                <h3 className="font-bold text-white text-base">{s.nombre}</h3>
                <p className="text-xs text-gray-400 mt-1">{s.descripcion || s.desc}</p>
              </div>

              <div className="space-y-2 border-t border-gray-800/80 pt-3 mt-4">
                <button
                  type="button"
                  onClick={() => setServicioModalFotos(s)}
                  className="w-full py-1.5 bg-gray-800/60 hover:bg-gray-800 text-gray-300 hover:text-white rounded-xl text-xs font-semibold border border-gray-700/50 flex items-center justify-center gap-1.5 transition"
                >
                  <Image className="w-3.5 h-3.5 text-yellow-500" /> Ver fotos / cortes
                </button>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {s.duracion || '30 min'}
                  </span>
                  <button
                    onClick={() => { setServicioIdSel(s.id); scrollToReserva(); }}
                    className="text-xs font-semibold text-yellow-500 hover:text-yellow-400 transition"
                  >
                    Elegir servicio →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN BARBEROS */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-white">Nuestros Barberos</h2>
          <p className="text-xs text-gray-400">Conoce al equipo y lee sus reseñas antes de agendar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {barberosBD.map((b) => (
            <div key={b.id} className="p-5 bg-[#151C2C] border border-gray-800 rounded-2xl space-y-4 hover:border-gray-700 transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <img
  src={resolverUrlImagen(b.fotoUrl) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=60'}
  alt={b.nombre}
  className="w-16 h-16 rounded-2xl object-cover border-2 border-yellow-500/40"
/>
                  <div>
                    <h3 className="font-bold text-white text-base">{b.nombre}</h3>
                    <p className="text-xs text-yellow-500">{b.especialidad || 'Barbero Profesional'}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="font-bold">{b.calificacion || '4.9'}</span>
                      <span className="text-gray-500">({b.resenasCount || (b.resenas ? b.resenas.length : 15)} reseñas)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-800/80">
                <button
                  onClick={() => setBarberoSeleccionadoResena(b)}
                  className="w-full py-2 bg-gray-800/60 hover:bg-gray-800 text-gray-300 hover:text-white font-medium rounded-xl text-xs transition flex items-center justify-center gap-1.5 border border-gray-700/50"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-yellow-500" /> Ver Reseñas
                </button>
                <button
                  onClick={() => scrollToReserva(b)}
                  className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 font-bold rounded-xl text-xs transition"
                >
                  Reservar con {b.nombre.split(' ')[0]}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FORMULARIO DE RESERVA */}
      <section id="reserva-section" className="max-w-2xl mx-auto p-8 bg-[#151C2C] border border-yellow-500/30 rounded-3xl shadow-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Reserva tu Cita</h2>
            <p className="text-xs text-gray-400">Completa tus datos para confirmar</p>
          </div>
          <button
            type="button"
            onClick={limpiarFormulario}
            className="px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl text-xs font-medium flex items-center gap-1.5 border border-gray-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-yellow-500" /> Limpiar campos
          </button>
        </div>

        {exito && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>¡Cita registrada con éxito en el sistema!</span>
          </div>
        )}

        {error && !exito && (
          <div className="p-4 bg-red-950/40 border border-red-900 rounded-2xl text-red-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {corteReferencia && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-xs text-yellow-500 flex justify-between items-center">
            <span>Estilo de corte elegido: <strong>{corteReferencia.titulo}</strong></span>
            <button
              type="button"
              onClick={() => setCorteReferencia(null)}
              className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg text-[11px] font-semibold transition"
            >
              <X className="w-3.5 h-3.5" /> Quitar estilo
            </button>
          </div>
        )}

        <form key={formKey} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Servicio</label>
              <select
                value={servicioIdSel}
                onChange={(e) => setServicioIdSel(Number(e.target.value))}
                className="w-full p-3 bg-[#0B0F17] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-yellow-500"
              >
                {serviciosBD.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre} - S/ {s.precio}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Barbero</label>
              <select
                value={barberoIdSel}
                onChange={(e) => setBarberoIdSel(Number(e.target.value))}
                className="w-full p-3 bg-[#0B0F17] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-yellow-500"
              >
                {barberosBD.map(b => (
                  <option key={b.id} value={b.id}>{b.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Tu Nombre</label>
              <input
                type="text"
                required
                placeholder="Ej. Juan Pérez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full p-3 bg-[#0B0F17] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Teléfono / WhatsApp</label>
              <input
                type="tel"
                required
                placeholder="987 654 321"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full p-3 bg-[#0B0F17] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-yellow-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Fecha</label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full p-3 bg-[#0B0F17] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-yellow-500 [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Hora</label>
              <input
                type="time"
                required
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full p-3 bg-[#0B0F17] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-yellow-500 [color-scheme:dark]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold rounded-xl text-sm transition shadow-lg shadow-yellow-500/10 mt-2"
          >
            {enviando ? 'Enviando...' : 'Confirmar Reserva'}
          </button>
        </form>
      </section>

      {/* MODALES */}
      <ResenasModal
        barbero={barberoSeleccionadoResena}
        isOpen={!!barberoSeleccionadoResena}
        onClose={() => setBarberoSeleccionadoResena(null)}
      />

      <FotosServicioModal
        servicio={servicioModalFotos}
        isOpen={!!servicioModalFotos}
        onClose={() => setServicioModalFotos(null)}
        corteSeleccionado={corteReferencia}
        onSeleccionarCorte={(corte) => {
          setCorteReferencia(corte);
          if (servicioModalFotos) setServicioIdSel(servicioModalFotos.id);
          scrollToReserva();
        }}
      />
    </div>
  );
}