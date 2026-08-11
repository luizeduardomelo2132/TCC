import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Calendar, Users, Dog, LayoutDashboard, ClipboardList, LogOut } from 'lucide-react';
import './Layout.scss';

export default function Layout() {
  const navigate = useNavigate();
  // Pega o cargo do usuário logado (se não tiver, assume como tutor por segurança)
  const userRole = localStorage.getItem('@TCC:role') || 'tutor';

  // Função para fazer logout
  const handleLogout = () => {
    localStorage.removeItem('@TCC:token');
    localStorage.removeItem('@TCC:role');
    navigate('/login');
    window.location.reload(); // Recarrega para ativar a trava do App.tsx
  };

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <h1 className="brand">🐾 Clínica Vet</h1>
        
        <nav className="nav-menu">
          <Link to="/" className="nav-link">
            <LayoutDashboard size={20} /> Início
          </Link>

          {(userRole === 'admin' || userRole === 'veterinario') && (
            <>
              <Link to="/tutores" className="nav-link">
                <Users size={20} /> Tutores
              </Link>
              <Link to="/pets" className="nav-link">
                <Dog size={20} /> Pets
              </Link>
            </>
          )}

          <Link to="/consultas" className="nav-link">
            <Calendar size={20} /> Consultas
          </Link>

          {userRole === 'veterinario' && (
            <Link to="/prontuarios" className="nav-link">
              <ClipboardList size={20} /> Prontuários
            </Link>
          )}
        </nav>

        {/* Botão de Sair fixado no final do menu */}
        <div className="nav-footer" style={{ marginTop: 'auto', padding: '1rem' }}>
          <button 
            onClick={handleLogout} 
            className="nav-link" 
            style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}
          >
            <LogOut size={20} /> Sair do Sistema
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}