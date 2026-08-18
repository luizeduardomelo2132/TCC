import { NavLink, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Users,
  Dog,
  LayoutDashboard,
  ClipboardList,
  LogOut,
  Stethoscope,
  PawPrint
} from 'lucide-react';

import './Sidebar.scss';

export default function Sidebar() {
  const navigate = useNavigate();

  const userRole = localStorage.getItem('@TCC:role') || 'tutor';

  // 1. Lógica simples para retornar a rota específica de cada dashboard
  const getDashboardRoute = () => {
    switch (userRole) {
      case 'admin':
        return '/dashboard-admin'; // Altere para a sua rota real do admin
      case 'veterinario':
        return '/dashboard-vet'; // Altere para a sua rota real do veterinário
      case 'tutor':
      default:
        return '/dashboard-tutor'; // Altere para a sua rota real do tutor
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('@TCC:token');
    localStorage.removeItem('@TCC:role');

    navigate('/login');
    window.location.reload();
  };

  return (
    <aside className="sidebar">

      {/* LOGO */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <PawPrint size={23} strokeWidth={1.8} />
        </div>

        <div className="brand-text">
          <span className="brand-name">Clínica</span>
          <span className="brand-name">Maximus</span>
          <small>SAÚDE ANIMAL</small>
        </div>
      </div>

      {/* MENU */}
      <nav className="nav-menu">

        {/* 2. Chamamos a função no 'to' para enviar o usuário ao lugar certo */}
        <NavLink
          to={getDashboardRoute()}
          end
          className={({ isActive }) =>
            `nav-link ${isActive ? 'active' : ''}`
          }
        >
          <LayoutDashboard />
          <span>Início</span>
        </NavLink>

        {(userRole === 'admin' || userRole === 'veterinario') && (
          <>
            <NavLink
              to="/tutores"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Users />
              <span>Tutores</span>
            </NavLink>

            <NavLink
              to="/pets"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Dog />
              <span>Pets</span>
            </NavLink>
          </>
        )}

        <NavLink
          to="/consultas"
          className={({ isActive }) =>
            `nav-link ${isActive ? 'active' : ''}`
          }
        >
          <CalendarDays />
          <span>Consultas</span>
        </NavLink>

        {userRole === 'veterinario' && (
          <NavLink
            to="/prontuarios"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <ClipboardList />
            <span>Prontuários</span>
          </NavLink>
        )}

        <NavLink
          to="/veterinarios"
          className={({ isActive }) =>
            `nav-link ${isActive ? 'active' : ''}`
          }
        >
          <Stethoscope />
          <span>Veterinários</span>
        </NavLink>

      </nav>

      {/* SAIR */}
      <div className="nav-footer">
        <button
          onClick={handleLogout}
          className="logout-link"
        >
          <LogOut />
          <span>Sair do Sistema</span>
        </button>
      </div>

    </aside>
  );
}