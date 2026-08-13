import { useState, useEffect } from 'react';
import api from '../../services/api'; 
import './Dashboard.scss'; 
import DashboardTutor from '../DashboardTutor/DashboardTutor';

export default function Dashboard() {
  const userRole = localStorage.getItem('@TCC:role') || 'tutor';

  // Estados para guardar os dados reais do banco
  const [totalTutores, setTotalTutores] = useState(0);
  const [totalPets, setTotalPets] = useState(0);
  const [consultas, setConsultas] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Busca os dados assim que a tela carrega
  useEffect(() => {
    const buscarDados = async () => {
      try {
        const resConsultas = await api.get('/consultas');
        setConsultas(resConsultas.data);

        // Busca Pets e Tutores apenas se tiver permissão (Admin ou Vet)
        if (userRole === 'admin' || userRole === 'veterinario') {
          const resPets = await api.get('/pets');
          setTotalPets(resPets.data.length);

          if (userRole === 'admin') {
            const resTutores = await api.get('/tutores');
            setTotalTutores(resTutores.data.length);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard", error);
      } finally {
        setCarregando(false);
      }
    };

    buscarDados();
  }, [userRole]);

  // Formata a data para exibir bonito na tabela
  const formatarData = (dataString: string) => {
    if (!dataString) return '--';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (carregando) {
    return (
      <div className="dashboard-container">
        <h1 className="page-title">Carregando dados...</h1>
      </div>
    );
  }

  // --- SE FOR TUTOR: Renderiza a nova tela inspirada na foto do site ---
  if (userRole === 'tutor') {
    return <DashboardTutor />;
  }

  // --- TELA DA RECEPÇÃO (ADMIN) ---
  const renderAdminDashboard = () => (
    <>
      <div className="summary-grid">
        <div className="summary-card">
          <h3>Total de Tutores</h3>
          <span className="number">{totalTutores}</span>
        </div>
        <div className="summary-card" style={{ borderTopColor: '#3b82f6' }}>
          <h3>Pets Cadastrados</h3>
          <span className="number">{totalPets}</span>
        </div>
        <div className="summary-card" style={{ borderTopColor: '#8b5cf6' }}>
          <h3>Consultas (Total)</h3>
          <span className="number">{consultas.length}</span>
        </div>
      </div>

      <div className="table-card">
        <h2>Últimas Consultas</h2>
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Data / Horário</th>
              <th>Pet</th>
              <th>Motivo / Observação</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {consultas.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center' }}>Nenhuma consulta agendada.</td></tr>
            ) : (
              consultas.slice(-5).reverse().map((consulta) => (
                <tr key={consulta._id}>
                  <td>{formatarData(consulta.dataConsulta || consulta.dataHorario)}</td>
                  <td>{consulta.petId?.nome || consulta.pet?.nome || 'Pet excluído'}</td>
                  <td>{consulta.motivo || consulta.observacoes || 'Atendimento Geral'}</td>
                  <td><span className="status-badge">Agendada</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  // --- TELA DO VETERINÁRIO ---
  const renderVeterinarioDashboard = () => (
    <>
      <div className="summary-grid">
        <div className="summary-card">
          <h3>Minhas Consultas</h3>
          <span className="number">{consultas.length}</span>
        </div>
        <div className="summary-card" style={{ borderTopColor: '#f59e0b' }}>
          <h3>Total de Pets</h3>
          <span className="number">{totalPets}</span>
        </div>
      </div>

      <div className="table-card">
        <h2>Minha Agenda</h2>
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Data / Horário</th>
              <th>Pet</th>
              <th>Motivo / Observação</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {consultas.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center' }}>Sua agenda está livre.</td></tr>
            ) : (
              consultas.map((consulta) => (
                <tr key={consulta._id}>
                  <td>{formatarData(consulta.dataConsulta || consulta.dataHorario)}</td>
                  <td>{consulta.petId?.nome || consulta.pet?.nome || 'Desconhecido'}</td>
                  <td>{consulta.motivo || consulta.observacoes || 'Atendimento Geral'}</td>
                  <td><span className="status-badge">Confirmado</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  return (
    <div className="dashboard-container">
      <h1 className="page-title">Painel de Controle</h1>
      {userRole === 'admin' && renderAdminDashboard()}
      {userRole === 'veterinario' && renderVeterinarioDashboard()}
    </div>
  );
}