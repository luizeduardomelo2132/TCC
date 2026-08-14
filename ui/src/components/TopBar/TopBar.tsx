import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TopBar.scss';

export default function Topbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [buscaGlobal, setBuscaGlobal] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Idealmente, você pegaria esses dados do Contexto de Autenticação ou localStorage
  const userName = localStorage.getItem('@TCC:nome') || 'Usuário';
  const userRole = localStorage.getItem('@TCC:role') || 'veterinario';

  const handleLogout = () => {
    localStorage.removeItem('@TCC:token');
    localStorage.removeItem('@TCC:role');
    navigate('/login');
  };

  // Lógica para fechar o menu do perfil ao clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="topbar-container">
      {/* 1. BARRA DE PESQUISA GLOBAL */}
      <div className="search-container">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Buscar pacientes, tutores ou consultas..."
          value={buscaGlobal}
          onChange={(e) => setBuscaGlobal(e.target.value)}
        />
      </div>

      <div className="topbar-actions">
        {/* SUGESTÃO: Botão de Ação Rápida */}
        <button className="quick-action-btn">
          + Novo Atendimento
        </button>

        {/* SUGESTÃO: Notificações */}
        <button className="icon-btn notification-btn" title="Notificações">
          🔔
          <span className="notification-badge">3</span>
        </button>

        {/* 2. MENU DE PERFIL */}
        <div className="profile-menu" ref={dropdownRef}>
          <button 
            className="profile-btn" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="profile-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <span className="profile-name">{userName}</span>
              <span className="profile-role-text">{userRole.toUpperCase()}</span>
            </div>
            <span className="dropdown-icon">▼</span>
          </button>

          {/* DROPDOWN DO PERFIL */}
          {isDropdownOpen && (
            <div className="dropdown-content">
              <button onClick={() => navigate('/perfil')}>
                 Editar Perfil
              </button>
              <button onClick={() => navigate('/configuracoes')}>
                 Configurações
              </button>
              
              <div className="dropdown-divider"></div>
              
              <button className="logout-btn" onClick={handleLogout}>
                 Sair do Sistema
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}