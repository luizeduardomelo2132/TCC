import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './DashboardVet.scss';

interface ConsultaVet {
  _id: string;
  dataConsulta: string;
  motivo: string;
  status: string;
  petId?: { 
    _id: string; 
    nome: string; 
    especie: string; 
    raca: string;
    tutorId?: { nome: string } | string;
  };
  tutorId?: { _id?: string; nome: string };
  veterinarioId?: { _id: string } | string;
}

export default function DashboardVet() {
  const navigate = useNavigate();
  const [minhaAgenda, setMinhaAgenda] = useState<ConsultaVet[]>([]);
  const [agora, setAgora] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(true);

  const carregarAgenda = async () => {
    try {
      setLoading(true);
      let dadosAgenda: ConsultaVet[] = [];

      try {
        // Tenta a rota otimizada
        const response = await api.get('/consultas/minha-agenda-hoje');
        dadosAgenda = response.data;
      } catch (err) {
        console.warn('Endpoint /minha-agenda-hoje indisponível. Executando fallback via /consultas...');
        
        // Fallback: busca todas as consultas e filtra localmente pelo dia atual
        const resGeral = await api.get('/consultas');
        const hojeStr = new Date().toDateString();

        dadosAgenda = resGeral.data.filter((c: ConsultaVet) => {
          const dataConsultaStr = new Date(c.dataConsulta).toDateString();
          return dataConsultaStr === hojeStr;
        });
      }

      setMinhaAgenda(dadosAgenda);
    } catch (error) {
      console.error('Erro ao carregar consultas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAgenda();

    // Atualiza a hora a cada 10 segundos para verificar troca de status em tempo real
    const timer = setInterval(() => {
      setAgora(new Date());
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  // Lógica de cálculo dinâmico de status por horário
  const obterStatusDinamico = (consulta: ConsultaVet) => {
    if (
      consulta.status === 'Concluída' ||
      consulta.status === 'Cancelada' ||
      consulta.status === 'Em Atendimento'
    ) {
      return consulta.status;
    }

    const horarioConsulta = new Date(consulta.dataConsulta);

    // Se atingiu ou passou o horário exato da consulta, muda para "Aguardando"
    if (agora >= horarioConsulta) {
      return 'Aguardando';
    }

    return 'Agendada';
  };

  const agendaProcessada = minhaAgenda.map((c) => ({
    ...c,
    statusExibido: obterStatusDinamico(c)
  }));

  const pacientesAguardando = agendaProcessada.filter(c => c.statusExibido === 'Aguardando').length;
  const pacientesAtendidos = agendaProcessada.filter(c => c.statusExibido === 'Concluída').length;

  const imgHero = "https://images.unsplash.com/photo-1628009368231-77e8b8cb6176?auto=format&fit=crop&q=80&w=800";

  return (
    <div className="dashboard-vet-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Agenda de Atendimento</h1>
          <p className="hero-subtitle">
            Acompanhe sua agenda, visualize os pacientes e realize os atendimentos da Clínica Maximus com praticidade e organização.
          </p>
          <div className="hero-actions">
            <button
              className="btn-primary"
              onClick={() => document.getElementById('fila-atendimento')?.scrollIntoView({ behavior: 'smooth' })}
            >
              + Ver Fila de Atendimento
            </button>
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
              <small>Prontos para atendimento</small>
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
              <strong>{agendaProcessada.length}</strong>
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
            <span className="agenda-count">{agendaProcessada.length} consultas</span>
          </div>

          <div className="patients-list">
            {loading ? (
              <p className="empty-state">Carregando consultas...</p>
            ) : agendaProcessada.length === 0 ? (
              <p className="empty-state">Sua agenda está livre por enquanto.</p>
            ) : (
              agendaProcessada.map((consulta) => {
                const pet = consulta.petId;
                
                // Trata o nome do tutor independentemente do nível de nesting da resposta
                const nomeTutor = 
                  consulta.tutorId?.nome || 
                  (typeof pet?.tutorId === 'object' ? pet.tutorId?.nome : null) || 
                  'Não informado';

                const status = consulta.statusExibido;
                const dataObj = new Date(consulta.dataConsulta);

                return (
                  <div
                    className={`patient-item ${status === 'Aguardando' ? 'is-waiting' : ''}`}
                    key={consulta._id}
                  >
                    <div className="time-block">
                      <span className="time">
                        {dataObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`status-badge ${status.toLowerCase().replace('í', 'i').replace(/\s/g, '-')}`}>
                        {status}
                      </span>
                    </div>

                    <div className="patient-info">
                      <div className="info-header">
                        <div className="pet-avatar">
                          {pet?.especie?.toLowerCase() === 'gato' ? '🐱' : '🐶'}
                        </div>
                        <div>
                          <h4>{pet?.nome || 'Pet Não Identificado'}</h4>
                          <span>
                            {pet?.especie || 'Espécie N/I'} • {pet?.raca || 'Sem raça definida'}
                          </span>
                        </div>
                      </div>
                      <p className="reason">
                        <strong>Motivo:</strong> {consulta.motivo}
                      </p>
                      <p className="tutor">
                        <strong>Tutor:</strong> {nomeTutor}
                      </p>
                    </div>

                    <div className="action-buttons">
                      <button
                        className="btn-secondary"
                        onClick={() => pet?._id && navigate(`/perfil-pet/${pet._id}`)}
                      >
                        Ver Prontuário
                      </button>
                      <button
                        className="btn-primary"
                        onClick={() => navigate(`/prontuarios/novo/${consulta._id}`)}
                      >
                        Iniciar Consulta
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}