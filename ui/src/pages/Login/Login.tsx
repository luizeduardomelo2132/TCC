import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Login.scss';

export default function Login() {
  const [modoLogin, setModoLogin] = useState(true);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState('tutor');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (modoLogin) {
        const response = await api.post('/auth/login', { email, senha });

        // Captura a role (cargo/perfil) retornada pelo back-end
        const usuarioRole = response.data.usuario.role;

        // Salva token e perfil no localStorage com o prefixo @TCC
        localStorage.setItem('@TCC:token', response.data.token);
        localStorage.setItem('@TCC:role', usuarioRole);

        // Redireciona para o dashboard correto baseado no perfil do usuário
        // Substitua o if/else que fizemos antes por este:
        if (usuarioRole === 'tutor') {
          navigate('/dashboard-tutor');
        } else if (usuarioRole === 'veterinario') {
          navigate('/dashboard-vet'); // Agora ele vai pro lugar certo!
        } else if (usuarioRole === 'admin') {
          navigate('/dashboard-admin');
        } else {
          navigate('/dashboard-tutor');
        }

      } else {
        // Envia todos os campos preenchidos no cadastro
        await api.post('/auth/registrar', { nome, email, senha, role, endereco });
        alert('Conta criada com sucesso! Faça login para entrar.');
        setModoLogin(true);
      }
    } catch (error) {
      console.error(error);
      alert('Erro de autenticação. Verifique os dados e tente novamente.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* LADO ESQUERDO: FOTO DO TUTOR COM SEU PET & MENSAGENS INSTITUCIONAIS */}
        <div className="login-hero-side">
          <div className="hero-overlay"></div>
          <img
            src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=900"
            alt="Tutor com seu Pet"
            className="hero-bg-img"
          />
          <div className="hero-content">
            <div className="brand-badge">
              <span className="paw-icon">🐾</span>
              <span>Clínica Maximus</span>
            </div>

            <h1 className="hero-title">
              Cuidando de quem enche a sua vida de amor.
            </h1>

            <p className="hero-description">
              Acesse a plataforma para acompanhar prontuários, consultas, vacinas e ter gestão completa da saúde do seu pet com toda a praticidade e carinho.
            </p>

            <div className="hero-features">
              <div className="feature-item">
                <span className="feature-icon">✨</span>
                <div>
                  <strong>Prontuário Digital</strong>
                  <p>Histórico clínico centralizado e seguro</p>
                </div>
              </div>

              <div className="feature-item">
                <span className="feature-icon">🗓️</span>
                <div>
                  <strong>Consultas e Vacinas</strong>
                  <p>Lembretes e agendamentos simplificados</p>
                </div>
              </div>

              <div className="feature-item">
                <span className="feature-icon">🩺</span>
                <div>
                  <strong>Equipe Especializada</strong>
                  <p>Medicina veterinária humanizada</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: CARD PRINCIPAL COM O FORMULÁRIO */}
        <div className="login-card">
          <div className="form-header">
            <h1 className="brand-mobile">🐾 Clínica Vet</h1>
            <h2>{modoLogin ? 'Acesse sua conta' : 'Crie sua conta'}</h2>
            <p className="subtitle">
              {modoLogin
                ? 'Insira suas credenciais para entrar no sistema'
                : 'Preencha os campos abaixo para criar seu cadastro'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {!modoLogin && (
              <>
                <div className="input-group">
                  <label>Nome Completo</label>
                  <div className="input-wrapper">
                    <span className="input-icon">👤</span>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Maria Silva"
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Eu sou um(a):</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🏷️</span>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                      <option value="tutor">Tutor (Cliente)</option>
                      <option value="veterinario">Veterinário</option>
                      <option value="admin">Recepcionista / Admin</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>Endereço</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🏠</span>
                    <input
                      type="text"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      placeholder="Rua, Número, Bairro"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="input-group">
              <label>E-mail</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Senha</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">
              {modoLogin ? 'Entrar no Sistema' : 'Cadastrar'}
            </button>
          </form>

          <div className="toggle-mode">
            <span>{modoLogin ? 'Ainda não tem conta?' : 'Já possui uma conta?'}</span>
            <button type="button" onClick={() => setModoLogin(!modoLogin)}>
              {modoLogin ? 'Cadastre-se' : 'Faça login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}