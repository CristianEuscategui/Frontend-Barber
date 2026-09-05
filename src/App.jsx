import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import CitaModal from './components/CitaModal';
import PaginaResena from './components/PaginaResena';
import { Scissors, Home, LayoutDashboard, LogOut, Plus } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AppShell() {
  const [vistaActual, setVistaActual] = useState('landing');
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('adminToken'));
  const [modalOpen, setModalOpen] = useState(false);
  const [dashboardKey, setDashboardKey] = useState(0);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuth(false);
  };

  const irAVista = (vista) => {
    setVistaActual(vista);
    navigate('/'); // asegura que volvemos a la ruta principal al cambiar de vista
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-gray-100 flex flex-col font-sans">
      <header className="border-b border-gray-800 bg-[#151C2C]/80 backdrop-blur sticky top-0 z-40 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => irAVista('landing')}>
          <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-500">
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-white">BARBER<span className="text-yellow-500">PRO</span></h1>
            <p className="text-xs text-gray-400">System & Booking</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#0B0F17] p-1.5 rounded-xl border border-gray-800">
            <button
              onClick={() => irAVista('landing')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                vistaActual === 'landing' ? 'bg-yellow-500 text-zinc-950' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" /> Inicio / Web
            </button>
            <button
              onClick={() => irAVista('admin')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                vistaActual === 'admin' ? 'bg-yellow-500 text-zinc-950' : 'text-gray-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Admin Panel
            </button>
          </div>

          {vistaActual === 'admin' && isAuth && (
            <div className="flex items-center gap-2 border-l border-gray-800 pl-3">
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 text-xs font-bold rounded-lg transition"
              >
                <Plus className="w-4 h-4" /> Cita Admin
              </button>
              <button onClick={handleLogout} className="p-1.5 text-gray-400 hover:text-rose-400 transition">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        <Routes>
          <Route
            path="/"
            element={
              vistaActual === 'landing' ? (
                <LandingPage />
              ) : isAuth ? (
                <Dashboard key={dashboardKey} />
              ) : (
                <Login onLoginSuccess={() => setIsAuth(true)} />
              )
            }
          />
          <Route path="/resena/:citaId" element={<PaginaResena />} />
        </Routes>
      </main>

      <CitaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCitaCreada={() => setDashboardKey((prev) => prev + 1)}
      />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        theme="dark"
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}