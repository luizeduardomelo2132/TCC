import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './DashboardAdmin.scss';

interface ResumoDashboard {
  totalPets: number;
  totalTutores: number;
  consultasHoje: any[];
}

export default function DashboardAdmin() {
  const navigate = useNavigate();

  const [resumo, setResumo] = useState<ResumoDashboard>({
    totalPets: 0,
    totalTutores: 0,
    consultasHoje: [],
  });

  useEffect(() => {
    const carregarDashboard = async () => {
      try {
        const [resPets, resTutores, resConsultas] = await Promise.all([
          api.get('/pets'),
          api.get('/tutores'),
          api.get('/consultas'),
        ]);

        const hoje = new Date().toLocaleDateString('pt-BR');

        const consultasDoDia = resConsultas.data.filter(
          (c: any) =>
            new Date(c.dataConsulta).toLocaleDateString('pt-BR') === hoje
        );

        setResumo({
          totalPets: resPets.data.length,
          totalTutores: resTutores.data.length,
          consultasHoje: consultasDoDia,
        });
      } catch (error) {
        console.error('Erro ao carregar dashboard', error);
      }
    };

    carregarDashboard();
  }, []);

  const consultasPendentes = resumo.consultasHoje.filter(
    (c) => c.status !== 'Concluída' && c.status !== 'Cancelada'
  ).length;

  const imgHero =
    'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=800';

  return (
    <div className="dashboard-admin-container">

      {/* ================= HERO ================= */}
      <section className="dashboard-hero">

        <div className="hero-decoration hero-circle"></div>
        <span className="hero-cross cross-one">+</span>
        <span className="hero-cross cross-two">+</span>

        <div className="hero-content">
          <h1>Painel Administrativo</h1>

          <p>
            Acompanhe os principais indicadores da Clínica Maximus,
            gerencie pacientes, tutores e consultas de forma rápida e
            organizada.
          </p>

          <div className="hero-actions">
            <button
              className="hero-btn primary"
              onClick={() => navigate('/pets')}
            >
              <span>＋</span>
              Novo Pet
            </button>

            <button
              className="hero-btn secondary"
              onClick={() => navigate('/tutores')}
            >
              <span>＋</span>
              Novo Tutor
            </button>
          </div>
        </div>

        <div className="hero-image-wrapper">
          <div className="hero-image-background"></div>

          <img
            src={imgHero}
            alt="Clínica veterinária"
            className="hero-image"
          />

          <span className="image-cross">+</span>
        </div>

      </section>

      {/* ================= INDICADORES ================= */}
      <section className="overview-section">

        <div className="section-title">
          <div>
            <h2>Visão Geral da Clínica</h2>
            <p>
              Confira os principais dados do sistema atualmente.
            </p>
          </div>
        </div>

        <div className="stats-grid">

          {/* PETS */}
          <div className="stat-card">
            <div className="stat-icon pets-icon">
              🐾
            </div>

            <div className="stat-content">
              <span className="stat-label">
                Total de Pets
              </span>

              <strong className="stat-number">
                {resumo.totalPets}
              </strong>

              <span className="stat-description">
                Pacientes cadastrados
              </span>
            </div>
          </div>

          {/* TUTORES */}
          <div className="stat-card">
            <div className="stat-icon tutors-icon">
              ♧
            </div>

            <div className="stat-content">
              <span className="stat-label">
                Total de Tutores
              </span>

              <strong className="stat-number">
                {resumo.totalTutores}
              </strong>

              <span className="stat-description">
                Clientes cadastrados
              </span>
            </div>
          </div>

          {/* CONSULTAS */}
          <div className="stat-card">
            <div className="stat-icon consultations-icon">
              📅
            </div>

            <div className="stat-content">
              <span className="stat-label">
                Consultas de Hoje
              </span>

              <strong className="stat-number">
                {resumo.consultasHoje.length}
              </strong>

              <span className="stat-description">
                {consultasPendentes} atendimento(s) pendente(s)
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ================= AGENDA ================= */}
      <section className="agenda-section">

        <div className="agenda-card">

          <div className="agenda-header">

            <div>
              <h2>Agenda do Dia</h2>
              <p>
                Acompanhe os atendimentos agendados para hoje.
              </p>
            </div>

            <button
              className="see-all-button"
              onClick={() => navigate('/consultas')}
            >
              Ver todas
              <span>→</span>
            </button>

          </div>

          <div className="agenda-list">

            {resumo.consultasHoje.length === 0 ? (

              <div className="empty-agenda">
                <div className="empty-icon">📅</div>

                <h3>
                  Nenhuma consulta hoje
                </h3>

                <p>
                  Não há atendimentos agendados para esta data.
                </p>
              </div>

            ) : (

              resumo.consultasHoje.map((consulta) => (

                <div
                  className="agenda-item"
                  key={consulta._id}
                >

                  <div className="appointment-time">
                    <span>
                      {new Date(
                        consulta.dataConsulta
                      ).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="appointment-icon">
                    🐾
                  </div>

                  <div className="appointment-info">

                    <h3>
                      {consulta.petId?.nome || 'Pet'}

                      <span>
                        {consulta.petId?.especie || ''}
                      </span>
                    </h3>

                    <p>
                      <strong>Tutor:</strong>{' '}
                      {consulta.tutorId?.nome ||
                        'Não informado'}
                    </p>

                    <p>
                      <strong>Veterinário:</strong>{' '}
                      {consulta.veterinarioId?.nome ||
                        'A definir'}
                    </p>

                  </div>

                  <div className="appointment-status">

                    <span
                      className={`status-badge ${(
                        consulta.status || 'agendada'
                      )
                        .toLowerCase()
                        .replaceAll(' ', '_')}`}
                    >
                      {consulta.status || 'Agendada'}
                    </span>

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