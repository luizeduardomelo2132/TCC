import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  ChevronDown,
  Plus
} from 'lucide-react';

import './TopBar.scss';

export default function TopBar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [buscaGlobal, setBuscaGlobal] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const userName =
    localStorage.getItem('@TCC:nome') || 'Usuário';

  const userRole =
    localStorage.getItem('@TCC:role') || 'veterinario';

  const handleLogout = () => {
    localStorage.removeItem('@TCC:token');
    localStorage.removeItem('@TCC:role');

    navigate('/login');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  return (
    <header className="topbar-container">

      {/* PESQUISA */}
      <div className="search-container">

        <Search className="search-icon" />

        <input
          type="text"
          placeholder="Buscar pacientes, tutores ou consultas..."
          value={buscaGlobal}
          onChange={(e) =>
            setBuscaGlobal(e.target.value)
          }
        />

      </div>


      {/* AÇÕES */}
      <div className="topbar-actions">

        {/* NOVO ATENDIMENTO */}
        <button className="quick-action-btn">
          <Plus size={18} strokeWidth={2.3} />
          <span>Novo Atendimento</span>
        </button>


        {/* NOTIFICAÇÕES */}
        <button
          className="icon-btn notification-btn"
          title="Notificações"
        >
          <Bell size={23} strokeWidth={1.8} />

          <span className="notification-badge">
            3
          </span>
        </button>


        {/* PERFIL */}
        <div
          className="profile-menu"
          ref={dropdownRef}
        >

          <button
            className="profile-btn"
            onClick={() =>
              setIsDropdownOpen(
                !isDropdownOpen
              )
            }
          >

            <div className="profile-avatar">
              {userName
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="profile-info">

              <span className="profile-name">
                {userName}
              </span>

              <span className="profile-role-text">
                {userRole.toUpperCase()}
              </span>

            </div>

            <ChevronDown
              className="dropdown-icon"
              size={15}
              strokeWidth={2}
            />

          </button>


          {/* DROPDOWN */}
          {isDropdownOpen && (
            <div className="dropdown-content">

              <button
                onClick={() =>
                  navigate('/perfil')
                }
              >
                Editar Perfil
              </button>

              <button
                onClick={() =>
                  navigate('/configuracoes')
                }
              >
                Configurações
              </button>

              <div className="dropdown-divider" />

              <button
                className="logout-btn"
                onClick={handleLogout}
              >
                Sair do Sistema
              </button>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}