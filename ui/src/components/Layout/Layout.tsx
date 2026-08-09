import { Link, Outlet } from 'react-router-dom';
import { Calendar, Users, Dog, LayoutDashboard } from 'lucide-react';
import './Layout.scss';

export default function Layout() {
  return (
    <div className="layout-container">
      <aside className="sidebar">
        <h1 className="brand">🐾 Clínica Vet</h1>
        <nav className="nav-menu">
          <Link to="/" className="nav-link">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/tutores" className="nav-link">
            <Users size={20} /> Tutores
          </Link>
          <Link to="/pets" className="nav-link">
            <Dog size={20} /> Pets
          </Link>
          <Link to="/consultas" className="nav-link">
            <Calendar size={20} /> Consultas
          </Link>
          <Link to="/prontuarios" className="nav-link">
            <Calendar size={20} /> Prontuários
          </Link>
        </nav>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}