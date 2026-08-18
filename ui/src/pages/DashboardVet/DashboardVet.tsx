import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './DashboardVet.scss';

interface ConsultaVet {
  _id: string;
  dataConsulta: string;
  motivo: string;
  status: string;
  petId: { _id: string; nome: string; especie: string; raca: string };
  tutorId: { nome: string };
}

export default function DashboardVet() {
  const navigate = useNavigate();
  const [minhaAgenda, setMinhaAgenda] = useState<ConsultaVet[]>([]);
  useEffect(() => {
    const carregarAgenda = async () => {
      try {
        const response = await api.get('/consultas/minha-agenda-hoje');
        setMinhaAgenda(response.data);
      } catch (error) {
        console.error('Erro ao carregar agenda do veterinário', error);
      }
    };

    // carregarAgenda();
    setMinhaAgenda([
      {
        _id: '1',
        dataConsulta: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
        motivo: 'Vacina Anual + Checkup',
        status: 'Aguardando',
        petId: { _id: 'p1', nome: 'Thor', especie: 'Cachorro', raca: 'Golden Retriever' },
        tutorId: { nome: 'João Silva' }
      },
      {
        _id: '2',
        dataConsulta: new Date(new Date().setHours(11, 30, 0, 0)).toISOString(),
        motivo: 'Problema de pele (Coceira)',
        status: 'Agendada',
        petId: { _id: 'p2', nome: 'Luna', especie: 'Gato', raca: 'Siamês' },
        tutorId: { nome: 'Maria Oliveira' }
      }
    ]);
    
  }, []);
  const pacientesAguardando = minhaAgenda.filter(c => c.status === 'Aguardando').length;
  const pacientesAtendidos = minhaAgenda.filter(c => c.status === 'Concluída').length;
  const imgHero = "https://images.unsplash.com/photo-1628009368231-77e8b8cb6176?auto=format&fit=crop&q=80&w=800";
  return (
    <div className="dashboard-vet-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Agenda de Atendimento</h1>
          <p className="hero-subtitle">Acompanhe sua agenda, visualize os pacientes e realize os atendimentos da Clínica Maximus com praticidade e organização.</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => document.getElementById('fila-atendimento')?.scrollIntoView({ behavior: 'smooth' })}>+ Ver Fila de Atendimento</button>
          </div>
        </div>
        <div className="hero-image">
          <img src={imgHero} alt="Veterinário em atendimento" />
        </div>
      </section>
      <section className="summary-section">
        <div className="section-header">
          <div>
            <h2>Resumo do Plantão</h2>
            <p>Visão geral dos seus atendimentos agendados para hoje.</p>
          </div>
        </div>
        <div className="summary-grid">
          <div className="summary-card waiting">
            <div className="summary-icon">🐾</div>
            <div className="summary-info">
              <span>Pacientes Aguardando</span>
              <strong>{pacientesAguardando}</strong>
              <small>Na recepção agora</small>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">✓</div>
            <div className="summary-info">
              <span>Já Atendidos</span>
              <strong>{pacientesAtendidos}</strong>
              <small>Consultas finalizadas hoje</small>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">📅</div>
            <div className="summary-info">
              <span>Total do Dia</span>
              <strong>{minhaAgenda.length}</strong>
              <small>Consultas agendadas</small>
            </div>
          </div>
        </div>
      </section>
      <section className="agenda-section" id="fila-atendimento">
        <div className="clinical-panel">
          <div className="panel-header">
            <div>
              <h2>Fila de Atendimento</h2>
              <p>Visualize os pacientes e inicie os atendimentos agendados.</p>
            </div>
            <span className="agenda-count">{minhaAgenda.length} consultas</span>
          </div>
          <div className="patients-list">
            {minhaAgenda.length === 0 ? (
              <p className="empty-state">Sua agenda está livre por enquanto.</p>
            ) : (
              minhaAgenda.map((consulta) => (
                <div className={`patient-item ${consulta.status === 'Aguardando' ? 'is-waiting' : ''}`} key={consulta._id}>
                  <div className="time-block">
                    <span className="time">{new Date(consulta.dataConsulta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className={`status-badge ${consulta.status.toLowerCase().replace('í', 'i')}`}>{consulta.status}</span>
                  </div>
                  <div className="patient-info">
                    <div className="info-header">
                      <div className="pet-avatar">{consulta.petId.especie?.toLowerCase() === 'gato' ? '🐱' : '🐶'}</div>
                      <div>
                        <h4>{consulta.petId.nome}</h4>
                        <span>{consulta.petId.especie} • {consulta.petId.raca}</span>
                      </div>
                    </div>
                    <p className="reason"><strong>Motivo:</strong> {consulta.motivo}</p>
                    <p className="tutor"><strong>Tutor:</strong> {consulta.tutorId.nome}</p>
                  </div>
                  <div className="action-buttons">
                    <button className="btn-secondary" onClick={() => navigate(`/perfil-pet/${consulta.petId._id}`)}>Ver Prontuário</button>
                    <button className="btn-primary" onClick={() => navigate(`/prontuarios/novo/${consulta._id}`)}>Iniciar Consulta</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}