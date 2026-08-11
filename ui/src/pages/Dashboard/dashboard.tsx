import { useState, useEffect } from 'react';
import api from '../../services/api'; // Confirme se o caminho para a sua API está correto
import './Dashboard.scss'; 

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
        // 1. Busca as consultas (Graças ao nosso bloqueio no Back-end, 
        // isso já vem filtrado automaticamente dependendo de quem está logado!)
        const resConsultas = await api.get('/consultas');
        setConsultas(resConsultas.data);

        // 2. Busca Pets e Tutores apenas se tiver permissão (Admin ou Vet)
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

  // Formata a data para ficar bonita na tela (Ex: 15/10/2026 - 14:30)
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
              <th>Motivo</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {consultas.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center' }}>Nenhuma consulta agendada.</td></tr>
            ) : (
              // Mostra apenas as 5 últimas consultas cadastradas
              consultas.slice(-5).reverse().map((consulta) => (
                <tr key={consulta._id}>
                  <td>{formatarData(consulta.dataConsulta)}</td>
                  <td>{consulta.petId?.nome || 'Pet excluído'}</td>
                  <td>{consulta.motivo}</td>
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
              <th>Motivo</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {consultas.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center' }}>Sua agenda está livre.</td></tr>
            ) : (
              consultas.map((consulta) => (
                <tr key={consulta._id}>
                  <td>{formatarData(consulta.dataConsulta)}</td>
                  <td>{consulta.petId?.nome || 'Desconhecido'}</td>
                  <td>{consulta.motivo}</td>
                  <td><span className="status-badge">Confirmado</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  // --- TELA DO TUTOR ---
  const renderTutorDashboard = () => {
    // Pega a consulta mais recente do tutor
    const proximaConsulta = consultas.length > 0 ? consultas[consultas.length - 1] : null;

    return (
      <div className="summary-grid">
        <div className="summary-card" style={{ borderTopColor: '#3b82f6' }}>
          <h3>Próxima Consulta</h3>
          {proximaConsulta ? (
             <>
               <span className="number" style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
                 {formatarData(proximaConsulta.dataConsulta)}
               </span>
               <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 'bold' }}>
                 Pet: {proximaConsulta.petId?.nome || 'Seu Pet'}
               </span>
             </>
          ) : (
             <span className="number" style={{ fontSize: '1.2rem' }}>Nenhuma consulta</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <h1 className="page-title">
        {userRole === 'tutor' ? 'Meu Painel' : 'Painel de Controle'}
      </h1>

      {userRole === 'admin' && renderAdminDashboard()}
      {userRole === 'veterinario' && renderVeterinarioDashboard()}
      {userRole === 'tutor' && renderTutorDashboard()}
    </div>
  );
}