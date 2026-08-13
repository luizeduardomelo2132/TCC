import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardTutor.scss';

export default function DashboardTutor() {
  const navigate = useNavigate();

  const handleSolicitarAtendimento = () => {
    navigate('/consultas');
  };

  return (
    <div className="dashboard-tutor">
      {/* Hero Principal */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Amor e Cuidado com seu Pet</h1>
          <p>
            Somos comprometidos com a saúde e felicidade do seu animal de estimação, 
            proporcionando cuidados de excelência e o carinho que ele merece todos os dias.
          </p>
          <button className="btn-agendar" onClick={handleSolicitarAtendimento}>
            Solicitar Atendimento
          </button>
        </div>
        <div className="hero-image">
          <img 
            src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600" 
            alt="Atendimento Veterinário com Cão e Gato" 
          />
        </div>
      </section>

      {/* Seção de Serviços */}
      <section className="servicos-section">
        <div className="servicos-header">
          <h2>Nossos Serviços</h2>
          <p>Contamos com uma equipe especializada para cuidar bem do seu pet. Confira alguns de nossos serviços:</p>
        </div>

        <div className="servicos-grid">
          <div className="servico-card" onClick={handleSolicitarAtendimento}>
            <img src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&q=80&w=300" alt="Clínica Médica / Cirúrgica" />
            <h3>Clínica Médica / Cirúrgica</h3>
            <p>Oferecemos serviços de clínica médica e cirúrgica de alta qualidade, garantindo a saúde do seu animal.</p>
          </div>

          <div className="servico-card" onClick={handleSolicitarAtendimento}>
            <img src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=300" alt="Especialidades" />
            <h3>Especialidades</h3>
            <p>Nossos especialistas dedicam-se a atender as necessidades específicas do seu animal.</p>
          </div>

          <div className="servico-card" onClick={handleSolicitarAtendimento}>
            <img src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=300" alt="Exames de Imagem" />
            <h3>Exames de Imagem</h3>
            <p>Utilizamos tecnologia avançada para exames diagnósticos precisos e ágeis.</p>
          </div>

          <div className="servico-card" onClick={handleSolicitarAtendimento}>
            <img src="https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=300" alt="Exames Laboratoriais" />
            <h3>Exames Laboratoriais</h3>
            <p>Análises de última geração oferecem diagnósticos confiáveis e rápidos.</p>
          </div>
        </div>
      </section>
    </div>
  );
}