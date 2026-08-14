import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, Dog, LayoutDashboard, ClipboardList, LogOut } from 'lucide-react';
import './Sidebar.scss';

export default function Sidebar() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('@TCC:role') || 'tutor';

  const handleLogout = () => {
    localStorage.removeItem('@TCC:token');
    localStorage.removeItem('@TCC:role');
    navigate('/login');
    window.location.reload(); 
  };

  return (
    <aside className="sidebar">
      <h1 className="brand"> Clínica Maximus</h1>
      
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
      
        <Link to="/veterinarios" className="nav-link">
          <Users size={20} /> Veterinários
        </Link>
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
  );
}