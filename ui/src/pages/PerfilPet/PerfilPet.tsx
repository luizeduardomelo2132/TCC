import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './PerfilPet.scss';
import {
  ArrowLeft,
  PawPrint,
  Tag,
  Scale,
  User,
  CalendarDays,
  ClipboardList,
  Cat,
  Dog,
} from 'lucide-react';

export default function PerfilPet() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pet, setPet] = useState<any>(null);
  const [consultas, setConsultas] = useState<any[]>([]);
  const [prontuarios, setProntuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarDadosDoPet = async () => {
      try {
        const resPet = await api.get(`/pets/${id}`);
        setPet(resPet.data);
        const resConsultas = await api.get(`/consultas?pet=${id}`);
        setConsultas(resConsultas.data);
        const resProntuarios = await api.get(`/prontuarios/pet/${id}`);
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

  const isGato = pet.especie?.toLowerCase() === 'gato';

  return (
    <div className="perfil-pet-container">
      <section className="hero-banner">
        <div className="hero-content">
          <h1 className="page-title">Perfil do Paciente</h1>
          <p className="hero-subtitle">Consulte os dados do paciente, acompanhe suas consultas e visualize todo o histórico médico e clínico.</p>
        </div>
        <div className="hero-image-wrapper">
          <div className="decor-shape"></div>
          <div className="decor-cross cross-1">+</div>
          <div className="decor-cross cross-2">+</div>
          <img src="https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&q=80&w=600" alt="Paciente Veterinário" className="pet-hero-img" />
        </div>
      </section>

      <section className="pet-identity-section">
        <div className="section-header">
          <div>
            <h2>Informações do Paciente</h2>
            <p>Dados cadastrais e informações gerais do animal.</p>
          </div>
          <button className="btn-voltar" onClick={() => navigate(-1)}>
            <ArrowLeft />
            Voltar
          </button>
        </div>
        <div className="pet-identity-card">
          <div className="pet-avatar">
            {isGato ? <Cat /> : <Dog />}
          </div>
          <div className="pet-info-grid">
            <div className="info-block">
              <span className="info-icon">
                <PawPrint />
              </span>
              <div>
                <small>Nome do Paciente</small>
                <strong>{pet.nome}</strong>
              </div>
            </div>
            <div className="info-block">
              <span className="info-icon">
                <Tag />
              </span>
              <div>
                <small>Espécie / Raça</small>
                <strong>{pet.especie} • {pet.raca || 'Não informada'}</strong>
              </div>
            </div>
            <div className="info-block">
              <span className="info-icon">
                <Scale />
              </span>
              <div>
                <small>Idade / Peso</small>
                <strong>{pet.idade || '--'} anos • {pet.peso || '--'} kg</strong>
              </div>
            </div>
            <div className="info-block">
              <span className="info-icon">
                <User />
              </span>
              <div>
                <small>Tutor Responsável</small>
                <strong>{pet.tutor?.nome || pet.tutorId?.nome || 'Não informado'}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="historico-grid">
        <section className="history-section">
          <div className="section-header">
            <div>
              <h2>Agenda e Consultas</h2>
              <p>Histórico de atendimentos realizados e agendados.</p>
            </div>
            <span className="badge">{consultas.length}</span>
          </div>
          <div className="list-container">
            {consultas.length === 0 ? (
              <div className="empty-msg">
                <CalendarDays />
                <p>Nenhuma consulta registrada.</p>
              </div>
            ) : (
              consultas.map((consulta, index) => (
                <div className="history-card" key={consulta._id || index}>
                  <div className="card-top">
                    <span className="date">
                      <CalendarDays />
                      {formatarData(consulta.data || consulta.dataConsulta)}
                    </span>
                    <span className="status">{consulta.status || 'Agendada'}</span>
                  </div>
                  <h4>{consulta.motivo || 'Consulta veterinária'}</h4>
                  <p><strong>Veterinário:</strong> Dr(a). {consulta.veterinario?.nome || 'Não atribuído'}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="history-section">
          <div className="section-header">
            <div>
              <h2>Prontuários Clínicos</h2>
              <p>Registros médicos e informações clínicas do paciente.</p>
            </div>
            <span className="badge">{prontuarios.length}</span>
          </div>
          <div className="list-container">
            {prontuarios.length === 0 ? (
              <div className="empty-msg">
                <ClipboardList />
                <p>Nenhum prontuário registrado.</p>
              </div>
            ) : (
              prontuarios.map((prontuario, index) => (
                <div className="history-card prontuario-card" key={prontuario._id || index}>
                  <div className="card-top">
                    <span className="date">
                      <ClipboardList />
                      {formatarData(prontuario.createdAt || prontuario.data)}
                    </span>
                  </div>
                  <div className="prontuario-content">
                    {prontuario.diagnostico && (
                      <p><strong>Diagnóstico:</strong> {prontuario.diagnostico}</p>
                    )}
                    {prontuario.prescricao && (
                      <p><strong>Prescrição:</strong> {prontuario.prescricao}</p>
                    )}
                    {prontuario.examesSolicitados && (
                      <p><strong>Exames:</strong> {prontuario.examesSolicitados}</p>
                    )}
                    {prontuario.observacoes && (
                      <p><strong>Observações:</strong> {prontuario.observacoes}</p>
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