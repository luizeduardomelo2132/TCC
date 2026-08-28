import { NavLink, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Users,
  Dog,
  Cat,
  LayoutDashboard,
  ClipboardList,
  LogOut,
  Stethoscope,
  PawPrint,
  ChevronRight
} from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import './Sidebar.scss';

interface Pet {
  _id: string;
  nome: string;
  especie?: string;
  tutorId?: string;
  tutor?: {
    _id: string;
    nome: string;
  };
}

export default function Sidebar() {
  const navigate = useNavigate();

  const userRole = localStorage.getItem('@TCC:role') || 'tutor';


  const [pets, setPets] = useState<Pet[]>([]);
  const [petsOpen, setPetsOpen] = useState(true);

  useEffect(() => {
    const buscarMeusPets = async () => {
      if (userRole !== 'tutor') {
        return;
      }

      try {
        const response = await api.get('/pets');
        setPets(response.data);
      } catch (error) {
        console.error('Erro ao buscar meus pets:', error);
        setPets([]);
      }
    };

    buscarMeusPets();
  }, [userRole]);

  const getDashboardRoute = () => {
    switch (userRole) {
      case 'admin':
        return '/dashboard-admin';
      case 'veterinario':
        return '/dashboard-vet';
      case 'tutor':
      default:
        return '/dashboard-tutor';
    }
  };

  // Tutor vê o formulário simplificado de solicitação de atendimento;
  // admin/veterinário continuam com a tela completa de agendamento.
  const getConsultasRoute = () => {
    return userRole === 'tutor' ? '/solicitar-consulta' : '/consultas';
  };

  const handleLogout = () => {
    localStorage.removeItem('@TCC:token');
    localStorage.removeItem('@TCC:role');
    localStorage.removeItem('@TCC:id');

    navigate('/login');
    window.location.reload();
  };

  return (
    <aside className="sidebar">

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

      <nav className="nav-menu">

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

        {userRole !== 'tutor' && (
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
          to={getConsultasRoute()}
          className={({ isActive }) =>
            `nav-link ${isActive ? 'active' : ''}`
          }
        >
          <CalendarDays />
          <span>Consultas</span>
        </NavLink>

        {userRole === 'tutor' && (
          <div className="pets-menu">

            <button
              type="button"
              className={`nav-link pets-toggle ${petsOpen ? 'active-parent' : ''}`}
              onClick={() => setPetsOpen(!petsOpen)}
            >
              <Dog />
              <span>Meus Pets</span>
              <ChevronRight className={`pets-arrow ${petsOpen ? 'open' : ''}`} size={15} />
            </button>

            {petsOpen && (
              <div className="pets-submenu">

                {pets.length === 0 ? (
                  <span className="no-pets">
                    Nenhum pet cadastrado
                  </span>
                ) : (
                  pets.map((pet) => (
                    <NavLink
                      key={pet._id}
                      to={`/perfil-pet/${pet._id}`}
                      className={({ isActive }) =>
                        `pet-link ${isActive ? 'active' : ''}`
                      }
                    >
                      <span className="pet-icon">
                        {pet.especie?.toLowerCase() === 'gato' ? <Cat size={14} /> : <Dog size={14} />}
                      </span>
                      <span>{pet.nome}</span>
                    </NavLink>
                  ))
                )}

              </div>
            )}

          </div>
        )}

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

        {userRole !== 'tutor' && (
          <NavLink
            to="/veterinarios"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <Stethoscope />
            <span>Veterinários</span>
          </NavLink>
        )}

      </nav>

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