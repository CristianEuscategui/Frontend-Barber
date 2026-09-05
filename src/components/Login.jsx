import React, { useState } from 'react';
import { Lock, User, KeyRound, AlertCircle, HelpCircle, CheckCircle2 } from 'lucide-react';
import { login, obtenerPreguntaSeguridad, recuperarPassword } from '../services/api';

export default function Login({ onLoginSuccess }) {
  const [credenciales, setCredenciales] = useState({ usuario: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Flujo de recuperación de contraseña
  const [modoRecuperar, setModoRecuperar] = useState(false);
  const [pasoRecuperar, setPasoRecuperar] = useState(1); // 1: usuario, 2: pregunta, 3: nueva contraseña
  const [usuarioRecuperar, setUsuarioRecuperar] = useState('');
  const [preguntaSeguridad, setPreguntaSeguridad] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [nuevaPass, setNuevaPass] = useState('');
  const [mensajeRecuperar, setMensajeRecuperar] = useState({ tipo: '', texto: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const res = await login(credenciales.usuario, credenciales.password);
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminUser', res.data.usuario);
      onLoginSuccess();
    } catch (err) {
      const mensaje = err.response?.data?.message || 'Usuario o contraseña incorrectos.';
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  const handleBuscarPregunta = async (e) => {
    e.preventDefault();
    setMensajeRecuperar({ tipo: '', texto: '' });
    try {
      const res = await obtenerPreguntaSeguridad(usuarioRecuperar);
      setPreguntaSeguridad(res.data);
      setPasoRecuperar(2);
    } catch (err) {
      const mensaje = err.response?.data?.message || 'No se pudo encontrar ese usuario.';
      setMensajeRecuperar({ tipo: 'error', texto: mensaje });
    }
  };

  const handleVerificarYRestablecer = async (e) => {
    e.preventDefault();
    setMensajeRecuperar({ tipo: '', texto: '' });

    if (nuevaPass.length < 4) {
      setMensajeRecuperar({ tipo: 'error', texto: 'La contraseña debe tener al menos 4 caracteres.' });
      return;
    }

    try {
      await recuperarPassword({
        usuario: usuarioRecuperar,
        respuestaSeguridad: respuesta,
        nuevaPassword: nuevaPass,
      });
      setMensajeRecuperar({ tipo: 'success', texto: '¡Contraseña restablecida! Ya puedes iniciar sesión.' });
      setTimeout(() => {
        setModoRecuperar(false);
        setPasoRecuperar(1);
        setUsuarioRecuperar('');
        setRespuesta('');
        setNuevaPass('');
        setMensajeRecuperar({ tipo: '', texto: '' });
      }, 1800);
    } catch (err) {
      const mensaje = err.response?.data?.message || 'No se pudo restablecer la contraseña.';
      setMensajeRecuperar({ tipo: 'error', texto: mensaje });
    }
  };

  if (modoRecuperar) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-[#151C2C] border border-gray-800 rounded-2xl shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Recuperar Contraseña</h2>
          <p className="text-xs text-gray-400 mt-1">
            {pasoRecuperar === 1 ? 'Ingresa tu usuario para continuar' : 'Responde tu pregunta de seguridad'}
          </p>
        </div>

        {mensajeRecuperar.texto && (
          <div className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${mensajeRecuperar.tipo === 'error' ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'}`}>
            {mensajeRecuperar.tipo === 'error' ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
            <span>{mensajeRecuperar.texto}</span>
          </div>
        )}

        {pasoRecuperar === 1 ? (
          <form onSubmit={handleBuscarPregunta} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Usuario</label>
              <input
                type="text"
                required
                value={usuarioRecuperar}
                onChange={(e) => setUsuarioRecuperar(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0F17] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-yellow-500"
              />
            </div>
            <button type="submit" className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-zinc-950 font-bold rounded-xl text-sm transition">
              Continuar
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerificarYRestablecer} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">{preguntaSeguridad}</label>
              <input
                type="text"
                required
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0F17] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Nueva Contraseña</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={nuevaPass}
                onChange={(e) => setNuevaPass(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0F17] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-yellow-500"
              />
            </div>
            <button type="submit" className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold rounded-xl text-sm transition">
              Restablecer Contraseña
            </button>
          </form>
        )}

        <button
          onClick={() => {
            setModoRecuperar(false);
            setPasoRecuperar(1);
            setUsuarioRecuperar('');
            setRespuesta('');
            setNuevaPass('');
            setMensajeRecuperar({ tipo: '', texto: '' });
          }}
          className="w-full mt-3 text-xs text-gray-500 hover:text-gray-300 transition"
        >
          ← Volver al inicio de sesión
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-[#151C2C] border border-gray-800 rounded-2xl shadow-2xl">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-3">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Acceso Administrativo</h2>
        <p className="text-xs text-gray-400 mt-1">Ingresa tus credenciales para administrar la barbería</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Usuario</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              required
              placeholder="admin"
              value={credenciales.usuario}
              onChange={(e) => setCredenciales({ ...credenciales, usuario: e.target.value })}
              className="w-full pl-9 pr-3 py-2 bg-[#0B0F17] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-yellow-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Contraseña</label>
          <div className="relative">
            <KeyRound className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={credenciales.password}
              onChange={(e) => setCredenciales({ ...credenciales, password: e.target.value })}
              className="w-full pl-9 pr-3 py-2 bg-[#0B0F17] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-yellow-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold rounded-xl text-sm transition shadow-lg shadow-yellow-500/10 mt-2"
        >
          {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>

        <button
          type="button"
          onClick={() => setModoRecuperar(true)}
          className="w-full text-xs text-gray-500 hover:text-yellow-500 transition"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </form>
    </div>
  );
}