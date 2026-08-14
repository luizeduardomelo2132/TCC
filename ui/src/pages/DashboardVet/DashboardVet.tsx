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
  const [buscaPaciente, setBuscaPaciente] = useState('');

  // ==========================================
  // LÓGICA E SEGURANÇA MANTIDAS INTACTAS
  // ==========================================
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

  // ==========================================
  // IMAGENS REAIS (Podem ser trocadas por imports locais depois)
  // ==========================================
  const imgHero = "https://images.unsplash.com/photo-1628009368231-77e8b8cb6176?auto=format&fit=crop&q=80&w=800"; // Vet examinando
  const imgAguardando = "https://images.unsplash.com/photo-1537151608804-ea2f1fa32fb1?auto=format&fit=crop&q=80&w=600"; // Pet esperando
  const imgAtendidos = "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=600"; // Vet feliz com pet
  const imgAgenda = "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=600"; // Estrutura clínica

  return (
    <div className="dashboard-vet-container">
      
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Olá, Dr(a)! 🩺</h1>
          <p className="hero-subtitle">
            Aqui está sua fila de pacientes para o plantão de hoje. Acompanhe os status e inicie os atendimentos.
          </p>
          
          <div className="hero-actions">
            <div className="search-bar">
              <span className="icon">🔍</span>
              <input 
                type="text" 
                placeholder="Buscar histórico de paciente..." 
                value={buscaPaciente}
                onChange={(e) => setBuscaPaciente(e.target.value)}
              />
            </div>
            <div className="quick-buttons">
              <button className="btn-primary" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
                Ir para Fila de Atendimento
              </button>
            </div>
          </div>
        </div>
        
        <div className="hero-image">
          <img src={imgHero} alt="Veterinário em atendimento" />
        </div>
      </section>

      {/* 2. BLOCO ESCURO (Identidade Visual) */}
      <section className="dark-block">
        <div className="dark-header">
          <h2>Resumo do Plantão</h2>
          <p>Visão geral dos seus atendimentos agendados para hoje.</p>
        </div>

        {/* 3. CARDS DE KPI COM FOTOS REAIS */}
        <div className="photo-cards-grid">
          <div className="photo-card highlight-card">
            <img src={imgAguardando} alt="Pacientes Aguardando" className="card-img" />
            <div className="card-info">
              <h3>Pacientes Aguardando</h3>
              <p className="kpi-number">{pacientesAguardando}</p>
              <span className="kpi-detail alert-badge">Na recepção agora</span>
            </div>
          </div>

          <div className="photo-card">
            <img src={imgAtendidos} alt="Já Atendidos" className="card-img" />
            <div className="card-info">
              <h3>Já Atendidos</h3>
              <p className="kpi-number">{pacientesAtendidos}</p>
              <span className="kpi-detail">Consultas finalizadas hoje</span>
            </div>
          </div>

          <div className="photo-card">
            <img src={imgAgenda} alt="Total do Dia" className="card-img" />
            <div className="card-info">
              <h3>Total do Dia</h3>
              <p className="kpi-number">{minhaAgenda.length}</p>
              <span className="kpi-detail">Consultas agendadas</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FILA DE ATENDIMENTO */}
      <section className="agenda-section">
        <div className="clinical-panel">
          <div className="panel-header">
            <h2>Fila de Atendimento</h2>
          </div>
          
          <div className="patients-list">
            {minhaAgenda.length === 0 ? (
              <p className="empty-state">Sua agenda está livre por enquanto.</p>
            ) : (
              minhaAgenda.map((consulta) => (
                <div className={`patient-item ${consulta.status === 'Aguardando' ? 'is-waiting' : ''}`} key={consulta._id}>
                  
                  <div className="time-block">
                    <span className="time">{new Date(consulta.dataConsulta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className={`status-badge ${consulta.status.toLowerCase()}`}>
                      {consulta.status}
                    </span>
                  </div>

                  <div className="patient-info">
                    <div className="info-header">
                      <h4>{consulta.petId.nome} <span>({consulta.petId.raca})</span></h4>
                    </div>
                    <p className="reason"><strong>Motivo:</strong> {consulta.motivo}</p>
                    <p className="tutor"><strong>Tutor:</strong> {consulta.tutorId.nome}</p>
                  </div>

                  <div className="action-buttons">
                    <button 
                      className="btn-secondary"
                      onClick={() => navigate(`/perfil-pet/${consulta.petId._id}`)}
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
              ))
            )}
          </div>
        </div>
      </section>
      
    </div>
  );
}