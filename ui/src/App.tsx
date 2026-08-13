import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login/Login'; 
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/dashboard';
import Tutores from './pages/Tutores/Tutores';
import Pets from './pages/Pets/Pets';
import Consultas from './pages/Consultas/Consultas';
import Prontuarios from './pages/Prontuarios/Prontuarios';

// Trava que impede acessar o sistema sem token
const RotaProtegida = () => {
  const token = localStorage.getItem('@TCC:token');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública de Login */}
        <Route path="/login" element={<Login />} />

        {/* Rota raiz redireciona para o login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Rotas do sistema bloqueadas para quem não está logado */}
        <Route element={<RotaProtegida />}>
          <Route element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tutores" element={<Tutores />} />
            <Route path="pets" element={<Pets />} />
            <Route path="consultas" element={<Consultas />} />
            <Route path="prontuarios" element={<Prontuarios />} />
          </Route>
        </Route>

        {/* Qualquer URL inexistente vai para o login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}