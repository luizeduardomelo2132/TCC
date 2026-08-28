import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login/Login'; 
import Layout from './components/Layout/Layout';
import Tutores from './pages/Tutores/Tutores';
import Pets from './pages/Pets/Pets';
import Consultas from './pages/Consultas/Consultas';
import Prontuarios from './pages/Prontuarios/Prontuarios';
import Veterinarios from './pages/Veterinarios/Veterinarios';
import PerfilPet from './pages/PerfilPet/PerfilPet';
import DashboardAdmin from './pages/DashboardAdmin/DashboardAdmin';
import DashboardTutor from './pages/DashboardTutor/DashboardTutor';
import DashboardVet from './pages/DashboardVet/DashboardVet';
import Perfil from './pages/Perfil/Perfil';
import SolicitarConsulta from './pages/SolicitarConsulta/SolicitarConsulta';

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
            <Route path="dashboard-tutor" element={<DashboardTutor />} />
            <Route path="dashboard-admin" element={<DashboardAdmin />} />
            <Route path="dashboard-vet" element={<DashboardVet />} />
            <Route path="tutores" element={<Tutores />} />
            <Route path="pets" element={<Pets />} />
            <Route path="consultas" element={<Consultas />} />
            <Route path="prontuarios" element={<Prontuarios />} />
            <Route path="veterinarios" element={<Veterinarios />} />
            <Route path="perfil-pet/:id" element={<PerfilPet />} />
            <Route path="solicitar-consulta" element={<SolicitarConsulta />} />
            
            {/* NOVO: Rota do Perfil do Usuário Logado */}
            <Route path="perfil" element={<Perfil />} />
          </Route>
        </Route>

        {/* Qualquer URL inexistente vai para o login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}