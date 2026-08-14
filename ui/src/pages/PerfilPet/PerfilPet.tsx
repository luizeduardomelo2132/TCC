import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './PerfilPet.scss';

export default function PerfilPet() {
  const { id } = useParams<{ id: string }>(); // Pega o ID do pet na URL
  const navigate = useNavigate();

  const [pet, setPet] = useState<any>(null);
  const [consultas, setConsultas] = useState<any[]>([]);
  const [prontuarios, setProntuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarDadosDoPet = async () => {
      try {
        // 1. Busca os dados gerais do Pet
        const resPet = await api.get(`/pets/${id}`);
        setPet(resPet.data);

        // 2. Busca as Consultas vinculadas ao Pet
        // Ajuste a rota se no seu back-end for diferente (ex: /consultas?petId=)
        const resConsultas = await api.get(`/consultas?pet=${id}`);
        setConsultas(resConsultas.data);

        // 3. Busca os Prontuários vinculados ao Pet
        const resProntuarios = await api.get(`/prontuarios?pet=${id}`);
        setProntuarios(resProntuarios.data);

      } catch (error) {
        console.error('Erro ao buscar perfil do pet:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) buscarDadosDoPet();
  }, [id]);

  const formatarData = (dataStr: string) => {
    return new Date(dataStr).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return <div className="loading-state">Carregando perfil do paciente...</div>;
  }

  if (!pet) {
    return <div className="error-state">Paciente não encontrado.</div>;
  }

  return (
    <div className="perfil-pet-container">
      {/* HEADER - BOTÃO VOLTAR E TÍTULO */}
      <div className="page-header">
        <button className="btn-voltar" onClick={() => navigate(-1)}>
          ← Voltar para listagem
        </button>
        <h1>Ficha do Paciente</h1>
      </div>

      {/* CARD DE IDENTIDADE DO PET */}
      <section className="pet-identity-card">
        <div className="pet-avatar">
          {pet.especie?.toLowerCase() === 'gato' ? '🐱' : '🐶'}
        </div>
        <div className="pet-info-grid">
          <div className="info-block">
            <span>Nome do Paciente</span>
            <h3>{pet.nome}</h3>
          </div>
          <div className="info-block">
            <span>Espécie / Raça</span>
            <h3>{pet.especie} • {pet.raca}</h3>
          </div>
          <div className="info-block">
            <span>Idade / Peso</span>
            <h3>{pet.idade} anos • {pet.peso || '--'} kg</h3>
          </div>
          <div className="info-block tutor-block">
            <span>Tutor Responsável</span>
            <h3>{pet.tutor?.nome || pet.tutorId?.nome || 'Não informado'}</h3>
          </div>
        </div>
      </section>

      {/* ÁREA DE DUAS COLUNAS: CONSULTAS E PRONTUÁRIOS */}
      <div className="historico-grid">
        
        {/* COLUNA 1: CONSULTAS */}
        <section className="history-section">
          <div className="section-header">
            <h2>Agenda e Consultas</h2>
            <span className="badge">{consultas.length}</span>
          </div>
          <div className="list-container">
            {consultas.length === 0 ? (
              <p className="empty-msg">Nenhuma consulta registrada.</p>
            ) : (
              consultas.map((consulta, index) => (
                <div className="history-card" key={consulta._id || index}>
                  <div className="card-top">
                    <span className="date">📅 {formatarData(consulta.data)}</span>
                    <span className="status">{consulta.status || 'Agendada'}</span>
                  </div>
                  <h4>{consulta.motivo}</h4>
                  <p><strong>Vet:</strong> Dr(a). {consulta.veterinario?.nome || 'Não atribuído'}</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* COLUNA 2: PRONTUÁRIOS (Registros Clínicos) */}
        <section className="history-section">
          <div className="section-header">
            <h2>Prontuários Clínicos</h2>
            <span className="badge">{prontuarios.length}</span>
          </div>
          <div className="list-container">
            {prontuarios.length === 0 ? (
              <p className="empty-msg">Nenhum prontuário registrado.</p>
            ) : (
              prontuarios.map((prontuario, index) => (
                <div className="history-card prontuario-card" key={prontuario._id || index}>
                  <div className="card-top">
                    <span className="date">📄 {formatarData(prontuario.createdAt || prontuario.data)}</span>
                  </div>
                  <div className="prontuario-content">
                    {prontuario.diagnostico && (
                      <p><strong>Diagnóstico:</strong> {prontuario.diagnostico}</p>
                    )}
                    {prontuario.prescricao && (
                      <p><strong>Prescrição:</strong> {prontuario.prescricao}</p>
                    )}
                    {prontuario.observacoes && (
                      <p><strong>Obs:</strong> {prontuario.observacoes}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}