import axios from 'axios';
// BaseURL apuntando a la raíz del API backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
// Interceptor: agrega el token JWT a cada petición si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export const subirFotoBarbero = (id, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/barberos/${id}/foto`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const resolverUrlImagen = (fotoUrl) => {
  if (!fotoUrl) return null;
  if (fotoUrl.startsWith('http')) return fotoUrl; // ya es una URL externa completa
  return `${API_URL.replace('/api', '')}${fotoUrl}`; // ej: http://localhost:8080/images/xxx.jpg
};
// Endpoints para Citas
export const getCitas = () => api.get('/citas');
export const crearCita = (cita) => api.post('/citas', cita);
export const cambiarEstadoCita = (id, estado) => api.patch(`/citas/${id}/estado?estado=${estado}`);
export const eliminarCita = (id) => api.delete(`/citas/${id}`);
export const getLinkCancelacion = (citaId) => api.get(`/citas/${citaId}/link-cancelacion`);
export const getHorarios = () => api.get('/horarios');
export const actualizarHorario = (dia, datos) => api.put(`/horarios/${dia}`, datos);

// Endpoints para Barberos
export const getBarberos = () => api.get('/barberos');
export const crearBarbero = (barbero) => api.post('/barberos', barbero);
export const eliminarBarbero = (id) => api.delete(`/barberos/${id}`);
export const getTodosBarberos = () => api.get('/barberos/todos');
export const cambiarEstadoBarbero = (id, activo) => api.patch(`/barberos/${id}/estado?activo=${activo}`);
export const actualizarBarbero = (id, barbero) => api.put(`/barberos/${id}`, barbero);
export const getLinkNotificacionBarbero = (citaId) => api.get(`/citas/${citaId}/link-notificacion-barbero`);

// Endpoints para Servicios
export const getServicios = () => api.get('/servicios');

// Endpoints para Reseñas
// Endpoints para Reseñas
export const crearResena = (resena) => api.post('/resenas', resena);
export const getResenasPorBarbero = (barberoId) => api.get(`/resenas/barbero/${barberoId}`);
export const eliminarResena = (id) => api.delete(`/resenas/${id}`);

// Endpoint para el link de reseña de una cita
export const getLinkResena = (citaId) => api.get(`/citas/${citaId}/link-resena`);
export default api;

// Endoints para Autenticación y Recuperación de Contraseña
export const login = (usuario, password) => api.post('/auth/login', { usuario, password });
export const cambiarCredenciales = (datos) => api.put('/auth/credenciales', datos);
export const obtenerPreguntaSeguridad = (usuario) => api.get(`/auth/pregunta-seguridad/${usuario}`);
export const recuperarPassword = (datos) => api.post('/auth/recuperar-password', datos);

export const getServiciosAdmin = () => api.get('/servicios');
export const crearServicio = (servicio) => api.post('/servicios', servicio);
export const actualizarServicio = (id, servicio) => api.put(`/servicios/${id}`, servicio);
export const eliminarServicio = (id) => api.delete(`/servicios/${id}`);