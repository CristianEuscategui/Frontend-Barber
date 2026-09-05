import React, { useState } from 'react';
import { useEffect } from 'react';
import EditarBarberoModal from './EditarBarberoModal';
import {
  Calendar, Users, DollarSign, Clock, CheckCircle2, Trash2,
  UserPlus, Settings, Lock, User, RefreshCw, AlertCircle, Scissors, Check,
  UserX, UserCheck, MessageSquare, Pencil
} from 'lucide-react';
import { getCitas, cambiarEstadoCita, eliminarCita, getTodosBarberos, cambiarEstadoBarbero, crearBarbero, eliminarBarbero, getLinkResena, subirFotoBarbero, resolverUrlImagen, getLinkCancelacion, cambiarCredenciales, getServiciosAdmin, crearServicio, eliminarServicio, eliminarResena } from '../services/api';
import { toast } from 'react-toastify';
import { getHorarios, actualizarHorario } from '../services/api';
import EditarServicioModal from './EditarServicioModal';
import ResenasModal from './ResenasModal';
import FilaHorario from './FilaHorario';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Dashboard() {
  const [citas, setCitas] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [pestanaActiva, setPestanaActiva] = useState('citas'); // 'citas' | 'barberos' | 'configuracion'
  const [horarios, setHorarios] = useState([]);

  // Estados para Configuración de Credenciales
  const [adminUser, setAdminUser] = useState(localStorage.getItem('adminUser') || 'admin');
  const [adminPass, setAdminPass] = useState('');
  const [nuevoPass, setNuevoPass] = useState('');
  const [preguntaSeguridad, setPreguntaSeguridad] = useState(localStorage.getItem('adminSecurityQuestion') || '');
  const [respuestaSeguridad, setRespuestaSeguridad] = useState('');
  const [mensajeConfig, setMensajeConfig] = useState({ tipo: '', texto: '' });

  // Estado para Nuevo Barbero
  const [nombreBarbero, setNombreBarbero] = useState('');
  const [apellidoBarbero, setApellidoBarbero] = useState('');
  const [especialidadBarbero, setEspecialidadBarbero] = useState('');
  const [telefonoBarbero, setTelefonoBarbero] = useState('');
  const [emailBarbero, setEmailBarbero] = useState('');
  const [fotoBarbero, setFotoBarbero] = useState('');
  const [filtroBarbero, setFiltroBarbero] = useState('todos');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [barberoEditando, setBarberoEditando] = useState(null);
  const [archivoFotoBarbero, setArchivoFotoBarbero] = useState(null);
  const [barberoVerResenas, setBarberoVerResenas] = useState(null);

  const [servicios, setServicios] = useState([]);
const [servicioEditando, setServicioEditando] = useState(null);
const [nombreServicio, setNombreServicio] = useState('');
const [precioServicio, setPrecioServicio] = useState('');
const [duracionServicio, setDuracionServicio] = useState('');
   
 const [filtroEstado, setFiltroEstado] = useState('todos');
const [ocultarFinalizadas, setOcultarFinalizadas] = useState(
  localStorage.getItem('ocultarFinalizadas') === 'true'
);

const [fechaInicioReporte, setFechaInicioReporte] = useState('');
const [fechaFinReporte, setFechaFinReporte] = useState('');


const cargarDatosAdmin = async () => {
  setCargando(true);
  try {
    const [resCitas, resBarberos, resServicios, resHorarios] = await Promise.all([
      getCitas().catch(() => ({ data: [] })),
      getTodosBarberos().catch(() => ({ data: [] })),
      getServiciosAdmin().catch(() => ({ data: [] })),
      getHorarios().catch(() => ({ data: [] })),
    ]);
    setCitas(resCitas.data || []);
    setBarberos(resBarberos.data || []);
    setServicios(resServicios.data || []);
    setHorarios(resHorarios.data || []);
  } catch (err) {
    console.error("Error al cargar datos del panel:", err);
  } finally {
    setCargando(false);
  }
};

  useEffect(() => {
    cargarDatosAdmin();
  }, []);

  // Cálculos reales para las tarjets superiores
  const totalCitas = citas.length;
  const citasPendientes = citas.filter(c => c.estado === 'PENDIENTE' || !c.estado).length;
const ingresosTotales = citas
  .filter(c => c.estado === 'TERMINADA')
  .reduce((acc, curr) => acc + (Number(curr.precio) || 35), 0);
const clientesUnicos = new Set(
  citas.filter(c => c.estado === 'TERMINADA').map(c => c.clienteTelefono || c.clienteNombre)
).size;
  // Acciones de Citas
const handleCambiarEstado = async (id, nuevoEstado) => {
  try {
    await cambiarEstadoCita(id, nuevoEstado);
    toast.success("Estado de la cita actualizado correctamente.");

    if (nuevoEstado === 'CANCELADA') {
      try {
        const res = await getLinkCancelacion(id);
        window.open(res.data, '_blank');
      } catch (err) {
        console.error('No se pudo generar el aviso de cancelación:', err);
      }
    }

    cargarDatosAdmin();
  } catch (err) {
    console.error("Error al actualizar estado:", err);
    toast.error("No se pudo actualizar el estado de la cita. Intenta nuevamente.");
  }
};
  const handleEliminarCita = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta cita?")) return;
    try {
      await eliminarCita(id);
      toast.success("Cita eliminada correctamente.");
      cargarDatosAdmin();
    } catch (err) {
      console.error("Error al eliminar cita:", err);
      toast.error("No se pudo eliminar la cita.");
    }
  };
  const handleEnviarLinkResena = async (id) => {
  try {
    const res = await getLinkResena(id);
    window.open(res.data, '_blank');
  } catch (err) {
    console.error("Error al generar link de reseña:", err);
    toast.error("No se pudo generar el enlace de reseña.");
  }
};
const handleCrearServicio = async (e) => {
  e.preventDefault();
  try {
    await crearServicio({
      nombre: nombreServicio,
      precio: Number(precioServicio),
      duracionMinutos: Number(duracionServicio),
    });
    setNombreServicio('');
    setPrecioServicio('');
    setDuracionServicio('');
    toast.success('Servicio creado correctamente.');
    cargarDatosAdmin();
  } catch (err) {
    console.error('Error al crear servicio:', err);
    toast.error('No se pudo crear el servicio.');
  }
};

const handleEliminarServicio = async (id) => {
  if (!window.confirm('¿Eliminar este servicio? Esta acción no se puede deshacer.')) return;
  try {
    await eliminarServicio(id);
    toast.success('Servicio eliminado correctamente.');
    cargarDatosAdmin();
  } catch (err) {
    console.error('Error al eliminar servicio:', err);
    const mensaje = err.response?.data?.message || 'No se pudo eliminar el servicio. Puede que ya tenga citas asociadas.';
    toast.error(mensaje);
  }
};

const citasFiltradas = citas.filter(c => {
  const coincideBarbero = filtroBarbero === 'todos' || c.barberoNombre === filtroBarbero;
  const coincideFecha = !filtroFecha || c.fecha === filtroFecha;
  const coincideEstado = filtroEstado === 'todos' || c.estado === filtroEstado;
  const noOculta = !ocultarFinalizadas || (c.estado !== 'TERMINADA' && c.estado !== 'CANCELADA');
  return coincideBarbero && coincideFecha && coincideEstado && noOculta;
});

// Lista de nombres de barbero únicos, para el selector de filtro
const nombresBarberosUnicos = [...new Set(citas.map(c => c.barberoNombre).filter(Boolean))];

  // Acciones de Barberos
 const handleCrearBarbero = async (e) => {
  e.preventDefault();
  try {
    const res = await crearBarbero({
      nombre: nombreBarbero,
      apellido: apellidoBarbero || 'Profesional',
      especialidad: especialidadBarbero,
      telefono: telefonoBarbero || 'Sin teléfono',
      email: emailBarbero || 'barbero@barberpro.com',
      fotoUrl: fotoBarbero || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=60',
      activo: true
    });

    if (archivoFotoBarbero && res.data?.id) {
      await subirFotoBarbero(res.data.id, archivoFotoBarbero);
    }

    setNombreBarbero('');
    setApellidoBarbero('');
    setEspecialidadBarbero('');
    setTelefonoBarbero('');
    setEmailBarbero('');
    setFotoBarbero('');
    setArchivoFotoBarbero(null);

    toast.success("¡Barbero registrado con éxito!");
    cargarDatosAdmin();
  } catch (err) {
    console.error("Error al registrar barbero:", err);
    toast.error("Error al registrar el barbero en el servidor.");
  }
};

  const handleEliminarBarbero = async (id) => {
    if (!window.confirm("¿Eliminar a este barbero del sistema?")) return;
    try {
      await eliminarBarbero(id);
      toast.success("Barbero eliminado correctamente.");
      cargarDatosAdmin();
    } catch (err) {
      console.error("Error al eliminar barbero:", err);
      toast.error("No se pudo eliminar el barbero.");
    }
  };
  const handleToggleActivoBarbero = async (barbero) => {
  try {
    await cambiarEstadoBarbero(barbero.id, !barbero.activo);
    toast.success(`Barbero ${!barbero.activo ? 'activado' : 'desactivado'} correctamente.`);
    cargarDatosAdmin();
  } catch (err) {
    console.error("Error al cambiar estado del barbero:", err);
    toast.error("No se pudo actualizar el estado del barbero.");
  }
};

  // Guardar Cambios de Cuenta de Administrador
const handleGuardarConfiguracion = async (e) => {
  e.preventDefault();
  setMensajeConfig({ tipo: '', texto: '' });

  if (!adminPass) {
    setMensajeConfig({ tipo: 'error', texto: 'Debes ingresar tu contraseña actual para guardar cambios.' });
    return;
  }

  try {
    await cambiarCredenciales({
      usuarioActual: localStorage.getItem('adminUser') || 'admin',
      passwordActual: adminPass,
      nuevoUsuario: adminUser,
      nuevaPassword: nuevoPass || null,
      preguntaSeguridad: preguntaSeguridad || null,
      respuestaSeguridad: respuestaSeguridad || null,
    });

    localStorage.setItem('adminUser', adminUser);
    setMensajeConfig({ tipo: 'success', texto: '¡Credenciales actualizadas correctamente!' });
    setAdminPass('');
    setNuevoPass('');
    setRespuestaSeguridad('');
  } catch (err) {
    const mensaje = err.response?.data?.message || 'No se pudo actualizar la configuración.';
    setMensajeConfig({ tipo: 'error', texto: mensaje });
  }
};
const handleToggleOcultarFinalizadas = () => {
  const nuevoValor = !ocultarFinalizadas;
  setOcultarFinalizadas(nuevoValor);
  localStorage.setItem('ocultarFinalizadas', nuevoValor.toString());
};
const DIAS_ES = {
  MONDAY: 'Lunes', TUESDAY: 'Martes', WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves', FRIDAY: 'Viernes', SATURDAY: 'Sábado', SUNDAY: 'Domingo'
};
const ORDEN_DIAS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const handleGuardarHorario = async (dia, datos) => {
  try {
    await actualizarHorario(dia, datos);
    toast.success('Horario actualizado correctamente.');
    cargarDatosAdmin();
  } catch (err) {
    console.error('Error al actualizar horario:', err);
    const mensaje = err.response?.data?.message || 'No se pudo actualizar el horario.';
    toast.error(mensaje);
  }
};

const handleGenerarReporte = () => {
  if (!fechaInicioReporte || !fechaFinReporte) {
    toast.error('Selecciona la fecha de inicio y fin del período.');
    return;
  }
  if (fechaInicioReporte > fechaFinReporte) {
    toast.error('La fecha de inicio debe ser antes que la fecha de fin.');
    return;
  }

  const citasEnPeriodo = citas.filter(c =>
    c.estado === 'TERMINADA' &&
    c.fecha >= fechaInicioReporte &&
    c.fecha <= fechaFinReporte
  );

  if (citasEnPeriodo.length === 0) {
    toast.error('No hay citas terminadas en ese período.');
    return;
  }

  const totalIngresos = citasEnPeriodo.reduce((acc, c) => acc + (Number(c.precio) || 0), 0);

  // Desglose por barbero
  const porBarbero = {};
  citasEnPeriodo.forEach(c => {
    const nombre = c.barberoNombre || 'Sin asignar';
    if (!porBarbero[nombre]) porBarbero[nombre] = { cantidad: 0, total: 0 };
    porBarbero[nombre].cantidad += 1;
    porBarbero[nombre].total += Number(c.precio) || 0;
  });

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('BarberPro - Reporte de Ingresos', 14, 20);

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Período: ${fechaInicioReporte} al ${fechaFinReporte}`, 14, 28);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-PE')}`, 14, 34);

  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(`Ingresos Totales: S/ ${totalIngresos.toFixed(2)}`, 14, 44);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Citas atendidas: ${citasEnPeriodo.length}`, 14, 50);

  // Tabla resumen por barbero
  autoTable(doc, {
    startY: 58,
    head: [['Barbero', 'Citas Atendidas', 'Total (S/)']],
    body: Object.entries(porBarbero).map(([nombre, datos]) => [
      nombre,
      datos.cantidad.toString(),
      datos.total.toFixed(2),
    ]),
    theme: 'striped',
    headStyles: { fillColor: [234, 179, 8] },
  });

  // Tabla detallada de citas
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Detalle de Citas', 14, finalY);

  autoTable(doc, {
    startY: finalY + 4,
    head: [['Fecha', 'Cliente', 'Servicio', 'Barbero', 'Precio (S/)']],
    body: citasEnPeriodo.map(c => [
      c.fecha,
      c.clienteNombre,
      c.servicioNombre || 'Sin especificar',
      c.barberoNombre || 'Sin asignar',
      (Number(c.precio) || 0).toFixed(2),
    ]),
    theme: 'grid',
    headStyles: { fillColor: [21, 28, 44] },
    styles: { fontSize: 8 },
  });

  doc.save(`reporte-ingresos-${fechaInicioReporte}-al-${fechaFinReporte}.pdf`);
  toast.success('Reporte generado correctamente.');
};

  return (
    <div className="space-y-8 pb-12">
      {/* NAVEGACIÓN INTERNA DE PESTAÑAS */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#151C2C] p-4 rounded-2xl border border-gray-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPestanaActiva('citas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${pestanaActiva === 'citas' ? 'bg-yellow-500 text-zinc-950 shadow-lg shadow-yellow-500/10' : 'bg-gray-800/60 text-gray-300 hover:text-white'}`}
          >
            <Calendar className="w-4 h-4" /> Gestión de Citas
          </button>
          <button
            onClick={() => setPestanaActiva('barberos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${pestanaActiva === 'barberos' ? 'bg-yellow-500 text-zinc-950 shadow-lg shadow-yellow-500/10' : 'bg-gray-800/60 text-gray-300 hover:text-white'}`}
          >
            <Scissors className="w-4 h-4" /> Barberos ({barberos.length})
          </button>
          <button
  onClick={() => setPestanaActiva('servicios')}
  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${pestanaActiva === 'servicios' ? 'bg-yellow-500 text-zinc-950 shadow-lg shadow-yellow-500/10' : 'bg-gray-800/60 text-gray-300 hover:text-white'}`}
>
  <DollarSign className="w-4 h-4" /> Servicios ({servicios.length})
</button>
          <button
            onClick={() => setPestanaActiva('configuracion')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${pestanaActiva === 'configuracion' ? 'bg-yellow-500 text-zinc-950 shadow-lg shadow-yellow-500/10' : 'bg-gray-800/60 text-gray-300 hover:text-white'}`}
          >
            <Settings className="w-4 h-4" /> Configuración y Seguridad
          </button>
        </div>

        <button
          onClick={cargarDatosAdmin}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-medium flex items-center gap-1.5 border border-gray-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-yellow-500 ${cargando ? 'animate-spin' : ''}`} /> Actualizar Datos
        </button>
        <button
  onClick={() => setPestanaActiva('horario')}
  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${pestanaActiva === 'horario' ? 'bg-yellow-500 text-zinc-950 shadow-lg shadow-yellow-500/10' : 'bg-gray-800/60 text-gray-300 hover:text-white'}`}
>
  <Clock className="w-4 h-4" /> Horario
</button>
          <button
  onClick={() => setPestanaActiva('reportes')}
  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${pestanaActiva === 'reportes' ? 'bg-yellow-500 text-zinc-950 shadow-lg shadow-yellow-500/10' : 'bg-gray-800/60 text-gray-300 hover:text-white'}`}
>
  <DollarSign className="w-4 h-4" /> Reportes
</button>
      </div>

      {/* TARJETAS DE RESUMEN (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#151C2C] border border-gray-800 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Citas Totales</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{totalCitas}</h3>
          </div>
          <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl border border-yellow-500/20">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-[#151C2C] border border-gray-800 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Pendientes</p>
            <h3 className="text-2xl font-extrabold text-yellow-500 mt-1">{citasPendientes}</h3>
          </div>
          <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl border border-yellow-500/20">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-[#151C2C] border border-gray-800 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Ingresos Estimados</p>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">S/ {ingresosTotales.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-[#151C2C] border border-gray-800 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Clientes Atendidos</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{clientesUnicos}</h3>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* CONTENIDO SEGÚN LA PESTAÑA ACTIVA */}
      {pestanaActiva === 'citas' && (
        <div className="bg-[#151C2C] border border-gray-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-gray-800 pb-4 gap-4">
  <div>
    <h2 className="text-lg font-bold text-white">Listado General de Citas</h2>
    <p className="text-xs text-gray-400">
      Controla y cambia el estado de las reservas — {citasFiltradas.length} de {citas.length} citas
    </p>
  </div>
<div className="flex flex-col sm:flex-row flex-wrap gap-2">
  <select
    value={filtroBarbero}
    onChange={(e) => setFiltroBarbero(e.target.value)}
    className="px-3 py-2 bg-[#0B0F17] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-yellow-500"
  >
    <option value="todos">Todos los barberos</option>
    {nombresBarberosUnicos.map(nombre => (
      <option key={nombre} value={nombre}>{nombre}</option>
    ))}
  </select>
  <select
    value={filtroEstado}
    onChange={(e) => setFiltroEstado(e.target.value)}
    className="px-3 py-2 bg-[#0B0F17] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-yellow-500"
  >
    <option value="todos">Todos los estados</option>
    <option value="PENDIENTE">Pendiente</option>
    <option value="CONFIRMADA">Confirmada</option>
    <option value="TERMINADA">Terminada</option>
    <option value="CANCELADA">Cancelada</option>
  </select>
  <input
    type="date"
    value={filtroFecha}
    onChange={(e) => setFiltroFecha(e.target.value)}
    className="px-3 py-2 bg-[#0B0F17] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-yellow-500 [color-scheme:dark]"
  />
  <button
    onClick={handleToggleOcultarFinalizadas}
    className={`px-3 py-2 rounded-xl text-xs font-medium transition ${
      ocultarFinalizadas
        ? 'bg-yellow-500 text-zinc-950'
        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
    }`}
  >
    {ocultarFinalizadas ? '✓ Ocultando finalizadas' : 'Ocultar terminadas/canceladas'}
  </button>
  {(filtroBarbero !== 'todos' || filtroFecha || filtroEstado !== 'todos') && (
    <button
      onClick={() => { setFiltroBarbero('todos'); setFiltroFecha(''); setFiltroEstado('todos'); }}
      className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-medium transition"
    >
      Limpiar filtros
    </button>
  )}
</div>
</div>

          {citasFiltradas.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No hay citas que coincidan con los filtros seleccionados.
           </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Servicio</th>
                    <th className="py-3 px-4">Barbero</th>
                    <th className="py-3 px-4">Fecha y Hora</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-xs text-gray-300">
                  {citasFiltradas.map((c) => (
                    <tr key={c.id || c.clienteTelefono} className="hover:bg-gray-800/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{c.clienteNombre}</div>
                        <div className="text-gray-500 text-[11px]">{c.clienteTelefono}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-yellow-500">
                        {c.servicioNombre || 'Sin servicio'}
                       <div className="text-gray-400 text-[11px]">S/ {c.precio || 35}</div>
                       </td>
                       <td className="py-3.5 px-4">{c.barberoNombre || 'Por asignar'}</td>
                      <td className="py-3.5 px-4">
                        <div>{c.fecha}</div>
                        <div className="text-gray-500 text-[11px]">{c.hora}</div>
                      </td>
                     <td className="py-3.5 px-4 space-x-1">
  {(() => {
    const esFinal = c?.estado === 'TERMINADA' || c?.estado === 'CANCELADA';
    return (
      <>
        <button
          onClick={() => handleCambiarEstado(c?.id, 'CONFIRMADA')}
          title={esFinal ? 'Esta cita ya no se puede modificar' : 'Marcar como Confirmada'}
          disabled={esFinal}
          className={`p-2 rounded-xl transition inline-flex items-center ${
            esFinal
              ? 'bg-gray-800/40 text-gray-600 cursor-not-allowed'
              : c?.estado === 'CONFIRMADA'
                ? 'bg-blue-500 text-zinc-950 shadow-lg shadow-blue-500/20'
                : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
          }`}
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleCambiarEstado(c?.id, 'PENDIENTE')}
          title={esFinal ? 'Esta cita ya no se puede modificar' : 'Marcar como Pendiente'}
          disabled={esFinal}
          className={`p-2 rounded-xl transition inline-flex items-center ${
            esFinal
              ? 'bg-gray-800/40 text-gray-600 cursor-not-allowed'
              : c?.estado === 'PENDIENTE'
                ? 'bg-yellow-500 text-zinc-950 shadow-lg shadow-yellow-500/20'
                : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
          }`}
        >
          <Clock className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleCambiarEstado(c?.id, 'TERMINADA')}
          title={esFinal ? 'Esta cita ya no se puede modificar' : 'Marcar como Terminada (corte realizado)'}
          disabled={esFinal}
          className={`p-2 rounded-xl transition inline-flex items-center ${
            esFinal
              ? c?.estado === 'TERMINADA'
                ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20'
                : 'bg-gray-800/40 text-gray-600 cursor-not-allowed'
              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleCambiarEstado(c?.id, 'CANCELADA')}
          title={esFinal ? 'Esta cita ya no se puede modificar' : 'Marcar como Cancelada'}
          disabled={esFinal}
          className={`p-2 rounded-xl transition inline-flex items-center ${
            esFinal
              ? c?.estado === 'CANCELADA'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'bg-gray-800/40 text-gray-600 cursor-not-allowed'
              : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
        </button>
      </>
    );
  })()}
</td>
                      <td className="py-3.5 px-4 text-right space-x-1">
  {c?.estado === 'TERMINADA' && (
    <button
      onClick={() => handleEnviarLinkResena(c?.id)}
      title="Enviar solicitud de reseña por WhatsApp"
      className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl transition inline-flex items-center"
    >
      <MessageSquare className="w-4 h-4" />
    </button>
  )}
  <button
    onClick={() => handleEliminarCita(c?.id)}
    title="Eliminar Cita"
    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition inline-flex items-center"
  >
    <Trash2 className="w-4 h-4" />
  </button>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {pestanaActiva === 'barberos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario Agregar Barbero */}
          <div className="p-6 bg-[#151C2C] border border-gray-800 rounded-3xl space-y-4 h-fit">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-yellow-500" /> Registrar Nuevo Barbero
            </h2>
            <form onSubmit={handleCrearBarbero} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Marcos"
                  value={nombreBarbero}
                  onChange={(e) => setNombreBarbero(e.target.value)}
                  className="w-full p-3 bg-[#0B0F17] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Apellido</label>
                <input
                  type="text"
                  placeholder="Ej. Silva"
                  value={apellidoBarbero}
                  onChange={(e) => setApellidoBarbero(e.target.value)}
                  className="w-full p-3 bg-[#0B0F17] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Especialidad</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Fade & Diseños"
                  value={especialidadBarbero}
                  onChange={(e) => setEspecialidadBarbero(e.target.value)}
                  className="w-full p-3 bg-[#0B0F17] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Teléfono</label>
                <input
                  type="text"
                  placeholder="Ej. 987654321"
                  value={telefonoBarbero}
                  onChange={(e) => setTelefonoBarbero(e.target.value)}
                  className="w-full p-3 bg-[#0B0F17] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="Ej. marcela@barberpro.com"
                  value={emailBarbero}
                  onChange={(e) => setEmailBarbero(e.target.value)}
                  className="w-full p-3 bg-[#0B0F17] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
  <label className="block text-xs font-semibold text-gray-400 mb-1">
    O sube una foto desde tu dispositivo (tiene prioridad sobre la URL)
  </label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) => setArchivoFotoBarbero(e.target.files[0] || null)}
    className="w-full p-2.5 bg-[#0B0F17] border border-gray-800 rounded-xl text-xs text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-yellow-500 file:text-zinc-950 file:text-xs file:font-semibold file:cursor-pointer"
  />
</div>

              <button
                type="submit"
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 font-bold rounded-xl text-xs transition mt-2 shadow-lg shadow-yellow-500/10"
              >
                Agregar Barbero
              </button>
            </form>
          </div>

          {/* Listado de Barberos Existentes */}
          <div className="lg:col-span-2 p-6 bg-[#151C2C] border border-gray-800 rounded-3xl space-y-4">
            <h2 className="text-lg font-bold text-white">Barberos Activos en la Barbería</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {barberos.map((b) => (
<div key={b.id} className={`p-4 bg-[#0B0F17] border rounded-2xl flex items-center justify-between gap-3 ${b.activo ? 'border-gray-800' : 'border-gray-800/40 opacity-60'}`}>
  <div className="flex items-center gap-3">
    <img
  src={resolverUrlImagen(b.fotoUrl) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=60'}
  alt={b.nombre}
  className="w-12 h-12 rounded-xl object-cover border border-yellow-500/30"
/>
    <div>
      <h4 className="font-bold text-white text-sm">{b.nombre}</h4>
      <p className="text-[11px] text-yellow-500">{b.especialidad || 'Profesional'}</p>
      <span className={`text-[10px] font-semibold ${b.activo ? 'text-emerald-400' : 'text-gray-500'}`}>
        {b.activo ? '● Activo' : '○ Inactivo (no disponible para citas)'}
      </span>
    </div>
  </div>
  <div className="flex items-center gap-1.5">
     <button
    onClick={() => setBarberoVerResenas(b)}
    title="Ver y moderar reseñas"
    className="p-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl transition"
  >
    <MessageSquare className="w-4 h-4" />
  </button>
      <button
    onClick={() => setBarberoEditando(b)}
    title="Editar barbero"
    className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition"
  >
    <Pencil className="w-4 h-4" />
  </button>
    <button
      onClick={() => handleToggleActivoBarbero(b)}
      title={b.activo ? 'Desactivar (marcar como no disponible)' : 'Activar (disponible para citas)'}
      className={`p-2 rounded-xl transition ${b.activo ? 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'}`}
    >
      {b.activo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
    </button>
    <button
      onClick={() => handleEliminarBarbero(b.id)}
      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition"
      title="Eliminar barbero"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {pestanaActiva === 'servicios' && (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="p-6 bg-[#151C2C] border border-gray-800 rounded-3xl space-y-4 h-fit">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-yellow-500" /> Nuevo Servicio
      </h2>
      <form onSubmit={handleCrearServicio} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1">Nombre</label>
          <input
            type="text"
            required
            placeholder="Ej. Corte Fade"
            value={nombreServicio}
            onChange={(e) => setNombreServicio(e.target.value)}
            className="w-full p-3 bg-[#0B0F17] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-yellow-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1">Precio (S/)</label>
          <input
            type="number"
            step="0.01"
            required
            placeholder="35.00"
            value={precioServicio}
            onChange={(e) => setPrecioServicio(e.target.value)}
            className="w-full p-3 bg-[#0B0F17] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-yellow-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1">Duración (minutos)</label>
          <input
            type="number"
            required
            placeholder="30"
            value={duracionServicio}
            onChange={(e) => setDuracionServicio(e.target.value)}
            className="w-full p-3 bg-[#0B0F17] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-yellow-500"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 font-bold rounded-xl text-xs transition mt-2 shadow-lg shadow-yellow-500/10"
        >
          Agregar Servicio
        </button>
      </form>
    </div>

    <div className="lg:col-span-2 p-6 bg-[#151C2C] border border-gray-800 rounded-3xl space-y-4">
      <h2 className="text-lg font-bold text-white">Servicios Disponibles</h2>
      {servicios.length === 0 ? (
        <p className="text-xs text-gray-500 py-8 text-center">No hay servicios registrados.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {servicios.map((s) => (
            <div key={s.id} className="p-4 bg-[#0B0F17] border border-gray-800 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-white text-sm">{s.nombre}</h4>
                <p className="text-[11px] text-yellow-500">S/ {s.precio} — {s.duracionMinutos} min</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setServicioEditando(s)}
                  title="Editar servicio"
                  className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEliminarServicio(s.id)}
                  className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition"
                  title="Eliminar servicio"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}
{pestanaActiva === 'horario' && (
  <div className="max-w-2xl mx-auto p-8 bg-[#151C2C] border border-gray-800 rounded-3xl shadow-xl space-y-4">
    <div className="border-b border-gray-800 pb-4">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <Clock className="w-5 h-5 text-yellow-500" /> Horario de Atención
      </h2>
      <p className="text-xs text-gray-400 mt-1">Define en qué horarios los clientes pueden reservar citas</p>
    </div>

    <div className="space-y-3">
      {ORDEN_DIAS.map((diaKey) => {
        const h = horarios.find(x => x.diaSemana === diaKey);
        if (!h) return null;
        return (
          <FilaHorario
            key={diaKey}
            dia={diaKey}
            nombreDia={DIAS_ES[diaKey]}
            horario={h}
            onGuardar={handleGuardarHorario}
          />
        );
      })}
    </div>
  </div>
)}
{pestanaActiva === 'reportes' && (
  <div className="max-w-xl mx-auto p-8 bg-[#151C2C] border border-gray-800 rounded-3xl shadow-xl space-y-6">
    <div className="border-b border-gray-800 pb-4">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-yellow-500" /> Reporte de Ingresos
      </h2>
      <p className="text-xs text-gray-400 mt-1">
        Genera un PDF con el resumen de ingresos y citas atendidas en el período que elijas
      </p>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-1">Desde</label>
        <input
          type="date"
          value={fechaInicioReporte}
          onChange={(e) => setFechaInicioReporte(e.target.value)}
          className="w-full p-3 bg-[#0B0F17] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-yellow-500 [color-scheme:dark]"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-1">Hasta</label>
        <input
          type="date"
          value={fechaFinReporte}
          onChange={(e) => setFechaFinReporte(e.target.value)}
          className="w-full p-3 bg-[#0B0F17] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-yellow-500 [color-scheme:dark]"
        />
      </div>
    </div>

    <button
      onClick={handleGenerarReporte}
      className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 font-bold rounded-xl text-sm transition shadow-lg shadow-yellow-500/10"
    >
      Descargar Reporte PDF
    </button>

    <p className="text-[11px] text-gray-500 text-center">
      El reporte incluye solo citas marcadas como "Terminada" — ingresos realmente cobrados.
    </p>
  </div>
)}

      {pestanaActiva === 'configuracion' && (
        <div className="max-w-xl mx-auto p-8 bg-[#151C2C] border border-gray-800 rounded-3xl shadow-xl space-y-6">
          <div className="border-b border-gray-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-yellow-500" /> Configuración de Acceso Admin
            </h2>
            <p className="text-xs text-gray-400 mt-1">Personaliza el usuario y la contraseña comercial para el dueño del negocio</p>
          </div>

          {mensajeConfig.texto && (
            <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${mensajeConfig.tipo === 'error' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{mensajeConfig.texto}</span>
            </div>
          )}

          <form onSubmit={handleGuardarConfiguracion} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Nombre de Usuario Admin</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  required
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  className="w-full pl-10 p-3 bg-[#0B0F17] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Contraseña Actual (requerido para cambios)</label>
              <input
                type="password"
                placeholder="••••••••"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                className="w-full p-3 bg-[#0B0F17] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Nueva Contraseña (opcional)</label>
              <input
                type="password"
                placeholder="Déjalo en blanco si no deseas cambiarla"
                value={nuevoPass}
                onChange={(e) => setNuevoPass(e.target.value)}
                className="w-full p-3 bg-[#0B0F17] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-yellow-500"
              />
            </div>

            <div className="pt-2 border-t border-gray-800/60">
              <p className="text-xs font-semibold text-gray-400 mb-2 mt-2">Recuperación de Contraseña (por si la olvidas)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Pregunta de Seguridad</label>
              <input
                type="text"
                placeholder="Ej. ¿Cuál es el nombre de tu primera barbería?"
                value={preguntaSeguridad}
                onChange={(e) => setPreguntaSeguridad(e.target.value)}
                className="w-full p-3 bg-[#0B0F17] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Respuesta Secreta</label>
              <input
                type="text"
                placeholder="Solo tú debes saber esta respuesta"
                value={respuestaSeguridad}
                onChange={(e) => setRespuestaSeguridad(e.target.value)}
                className="w-full p-3 bg-[#0B0F17] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-yellow-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 font-bold rounded-xl text-xs transition shadow-lg shadow-yellow-500/10 mt-2"
            >
              Guardar Credenciales Comerciales
            </button>
          </form>
        </div>
      )}
       <EditarBarberoModal
        barbero={barberoEditando}
        isOpen={!!barberoEditando}
        onClose={() => setBarberoEditando(null)}
        onActualizado={cargarDatosAdmin}
      />
      <EditarServicioModal
  servicio={servicioEditando}
  isOpen={!!servicioEditando}
  onClose={() => setServicioEditando(null)}
  onActualizado={cargarDatosAdmin}
/>

    <ResenasModal
  barbero={barberoVerResenas}
  isOpen={!!barberoVerResenas}
  onClose={() => setBarberoVerResenas(null)}
  modoAdmin={true}
/>

    </div>
  );
}