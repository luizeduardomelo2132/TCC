import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Tutores from './pages/Tutores/Tutores';
import Pets from './pages/Pets/Pets';
import Consultas from './pages/Consultas/Consultas';
import Prontuarios from './pages/Prontuarios/Prontuarios';
import Login from './pages/Login/Login';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="tutores" element={<Tutores />} />
          <Route path="pets" element={<Pets />} />
          <Route path="consultas" element={<Consultas />} />
          <Route path="prontuarios" element={<Prontuarios />} />
          <Route path="login" element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}