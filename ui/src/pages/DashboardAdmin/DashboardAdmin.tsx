import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api'; // Ajuste o caminho conforme seu projeto
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


    // ==========================================
    // LÓGICA E SEGURANÇA MANTIDAS INTACTAS
    // ==========================================
    useEffect(() => {
        const carregarDashboard = async () => {
            try {
                const [resPets, resTutores, resConsultas] = await Promise.all([
                    api.get('/pets'),
                    api.get('/tutores'),
                    api.get('/consultas')
                ]);

                const hoje = new Date().toLocaleDateString('pt-BR');
                const consultasDoDia = resConsultas.data.filter((c: any) =>
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

    // ==========================================
    // IMAGENS REAIS (Podem ser trocadas depois)
    // ==========================================
    const imgHero = "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=800";
    const imgPets = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600"; // Cachorro
    const imgTutores = "https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?auto=format&fit=crop&q=80&w=600"; // Pessoa com pet
    const imgAgenda = "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=600"; // Clínica/Vet

    return (
        <div className="dashboard-admin-container">

            {/* 1. HERO SECTION (Estilo idêntico ao painel do Tutor) */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Bem-vindo(a), Admin!</h1>
                    <p className="hero-subtitle">
                        Acompanhe os indicadores em tempo real e gerencie todos os processos da Clínica Maximus com eficiência.
                    </p>
                    
                    {/* A Busca e as Ações Rápidas integradas no Hero */}
                    <div className="hero-actions">
                        
                        <div className="quick-buttons">
                            <button onClick={() => navigate('/pets')} className="btn-primary">
                                + Novo Pet
                            </button>
                            <button onClick={() => navigate('/tutores')} className="btn-secondary">
                                + Novo Tutor
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="hero-image">
                    <img src={imgHero} alt="Administração da Clínica" />
                </div>
            </section>

            {/* 2. BLOCO ESCURO (Identidade Visual Maximus) */}
            <section className="dark-block">
                <div className="dark-header">
                    <h2>Visão Geral da Clínica</h2>
                    <p>Contamos com dados atualizados para você tomar as melhores decisões hoje.</p>
                </div>

                {/* 3. CARDS DE KPI COM FOTOS REAIS */}
                <div className="photo-cards-grid">
                    <div className="photo-card">
                        <img src={imgPets} alt="Total de Pets" className="card-img" />
                        <div className="card-info">
                            <h3>Total de Pets</h3>
                            <p className="kpi-number">{resumo.totalPets}</p>
                            <span className="kpi-detail">Registrados no sistema</span>
                        </div>
                    </div>

                    <div className="photo-card">
                        <img src={imgTutores} alt="Total de Tutores" className="card-img" />
                        <div className="card-info">
                            <h3>Total de Tutores</h3>
                            <p className="kpi-number">{resumo.totalTutores}</p>
                            <span className="kpi-detail">Clientes ativos</span>
                        </div>
                    </div>

                    <div className="photo-card highlight-card">
                        <img src={imgAgenda} alt="Consultas de Hoje" className="card-img" />
                        <div className="card-info">
                            <h3>Consultas de Hoje</h3>
                            <p className="kpi-number">{resumo.consultasHoje.length}</p>
                            <span className="kpi-detail alert-badge">
                                {consultasPendentes} restam atender
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. AGENDA DO DIA (Mantida clara para facilitar a leitura) */}
            <section className="agenda-section">
                <div className="agenda-panel">
                    <div className="panel-header">
                        <h2>Agenda do Dia</h2>
                        <button className="btn-link" onClick={() => navigate('/consultas')}>Ver todas</button>
                    </div>

                    <div className="agenda-list">
                        {resumo.consultasHoje.length === 0 ? (
                            <p className="empty-state">Não há consultas agendadas para hoje.</p>
                        ) : (
                            resumo.consultasHoje.map((consulta) => (
                                <div className="agenda-item" key={consulta._id}>
                                    <div className="time">
                                        {new Date(consulta.dataConsulta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="details">
                                        <h4>{consulta.petId?.nome || 'Pet'} <span>({consulta.petId?.especie})</span></h4>
                                        <p>Tutor: {consulta.tutorId?.nome || 'Não informado'}</p>
                                        <p className="vet">Vet: {consulta.veterinarioId?.nome || 'A definir'}</p>
                                    </div>
                                    <div className="status-container">
                                        <span className={`status-badge ${(consulta.status || 'agendada').toLowerCase()}`}>
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