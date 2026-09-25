import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Login.scss';
import { Sun, Moon } from 'lucide-react';

const THEME_STORAGE_KEY = '@TCC:theme';

const contarLetras = (texto: string) => (texto.match(/[a-zA-ZÀ-ÿ]/g) || []).length;

export default function Login() {
  const [modoLogin, setModoLogin] = useState(true);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState('tutor');
  const [especialidade, setEspecialidade] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(false);
  const [temaEscuro, setTemaEscuro] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const salvo = localStorage.getItem(THEME_STORAGE_KEY);
    const ativo = salvo ? salvo === 'dark' : document.documentElement.classList.contains('dark-mode');
    setTemaEscuro(ativo);
    document.documentElement.classList.toggle('dark-mode', ativo);
  }, []);

  const alternarTema = () => {
    const novoValor = !temaEscuro;
    setTemaEscuro(novoValor);
    document.documentElement.classList.toggle('dark-mode', novoValor);
    localStorage.setItem(THEME_STORAGE_KEY, novoValor ? 'dark' : 'light');
  };

  const handleRoleChange = (novaRole: string) => {
    setRole(novaRole);
    if (novaRole !== 'veterinario') {
      setEspecialidade('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (modoLogin) {
        const response = await api.post('/auth/login', {
          email,
          senha
        });

        const usuarioId = response.data.usuario.id;
        const usuarioRole = response.data.usuario.role?.toLowerCase();
        const usuarioNome = response.data.usuario.nome;
        const senhaTemporaria = response.data.usuario.senhaTemporaria;

        localStorage.setItem('@TCC:token', response.data.token);
        localStorage.setItem('@TCC:id', usuarioId);
        localStorage.setItem('@TCC:role', usuarioRole);
        localStorage.setItem('@TCC:nome', usuarioNome);

        if (senhaTemporaria) {
          navigate('/definir-nova-senha');
          return;
        }

        if (usuarioRole === 'tutor') {
          navigate('/dashboard-tutor');
        } else if (usuarioRole === 'veterinario') {
          navigate('/dashboard-vet');
        } else if (usuarioRole === 'admin') {
          navigate('/dashboard-admin');
        } else {
          navigate('/dashboard-tutor');
        }
      } else {
        if (contarLetras(nome) < 4) {
          alert('O nome deve ter no mínimo 4 letras.');
          return;
        }

        if (contarLetras(endereco) < 8) {
          alert('O endereço deve ter no mínimo 8 letras.');
          return;
        }

        const payload: Record<string, any> = {
          nome,
          email,
          senha,
          role,
          telefone,
          endereco
        };

        if (role === 'veterinario') {
          payload.especialidade = especialidade;
        }

        await api.post('/auth/registrar', payload);

        alert('Conta criada com sucesso! Faça login para entrar.');
        setModoLogin(true);
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'Erro de autenticação. Verifique os dados e tente novamente.';
      alert(msg);
    }
  };

  return (
    <div className="login-container">
      <button
        type="button"
        className="theme-toggle"
        onClick={alternarTema}
        aria-label={temaEscuro ? 'Ativar modo claro' : 'Ativar modo escuro'}
        title={temaEscuro ? 'Ativar modo claro' : 'Ativar modo escuro'}
      >
        {temaEscuro ? <Sun /> : <Moon />}
      </button>

      <div className="login-page">
        <section className="login-left">
          <div className="decor-circle decor-circle-top"></div>
          <div className="decor-circle decor-circle-bottom"></div>
          <span className="decor-plus plus-top">+</span>
          <span className="decor-plus plus-bottom">+</span>

          <div className="left-content">
            <h1>
              Cuidamos de quem
              <br />
              faz parte da sua
              <br />
              melhor companhia.
            </h1>

            <p className="left-description">
              Aqui, tecnologia e carinho trabalham juntos
              <br />
              para oferecer o melhor atendimento para
              <br />
              seu pet e tranquilidade para você.
            </p>

            <div className="features">
              <div className="feature">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="4" width="18" height="17" rx="2"></rect>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="12" y1="12" x2="12" y2="17"></line>
                    <line x1="9.5" y1="14.5" x2="14.5" y2="14.5"></line>
                  </svg>
                </div>
                <div>
                  <strong>Agendamentos simples</strong>
                  <p>
                    Marque consultas com praticidade
                    <br />
                    e rapidez.
                  </p>
                </div>
              </div>

              <div className="feature">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="8.5"></circle>
                    <path d="M8 12h8"></path>
                    <path d="M10 9.5h.01"></path>
                    <path d="M14 9.5h.01"></path>
                  </svg>
                </div>
                <div>
                  <strong>Histórico completo</strong>
                  <p>
                    Acompanhe o histórico de saúde
                    <br />
                    do seu pet em um só lugar.
                  </p>
                </div>
              </div>

              <div className="feature">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M20.8 8.8c0 5.5-8.8 10.2-8.8 10.2S3.2 14.3 3.2 8.8C3.2 6.2 5.1 4 7.7 4c1.8 0 3.4 1 4.3 2.4C12.9 5 14.5 4 16.3 4c2.6 0 4.5 2.2 4.5 4.8Z"></path>
                  </svg>
                </div>
                <div>
                  <strong>Cuidado que acolhe</strong>
                  <p>
                    Nossa equipe está sempre pronta
                    <br />
                    para cuidar com amor.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-photo">
            <img
              src="https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&q=85&w=1200"
              alt="Família com seus animais de estimação"
            />
          </div>

          <div className="security-card">
            <div className="security-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3Z"></path>
                <path d="m8.5 12 2.2 2.2 4.8-5"></path>
              </svg>
            </div>
            <div>
              <strong>
                Seus dados e os do seu pet
                <br />
                sempre protegidos.
              </strong>
              <p>Segurança e privacidade são nossa prioridade.</p>
            </div>
          </div>
        </section>

        <section className="login-right">
          <div className="login-card">
            <div className="maximus-logo">
              <div className="logo-symbol">
                <svg viewBox="0 0 70 80" fill="none">
                  <path
                    d="M35 2L61 20V52L35 77L9 52V20L35 2Z"
                    fill="#80976B"
                  />
                  <path
                    d="M35 12L52 25V48L35 64L18 48V25L35 12Z"
                    fill="#F7F5ED"
                  />
                  <ellipse cx="25" cy="30" rx="4.5" ry="6" fill="#80976B" />
                  <ellipse cx="45" cy="30" rx="4.5" ry="6" fill="#80976B" />
                  <ellipse cx="21" cy="40" rx="4" ry="5.5" fill="#80976B" />
                  <ellipse cx="49" cy="40" rx="4" ry="5.5" fill="#80976B" />
                  <path
                    d="M35 35C29 35 25 39 25 44C25 49 29 53 35 53C41 53 45 49 45 44C45 39 41 35 35 35Z"
                    fill="#80976B"
                  />
                </svg>
              </div>
              <div className="logo-text">
                <strong>Clínica</strong>
                <strong>Maximus</strong>
                <span>SAÚDE ANIMAL</span>
              </div>
            </div>

            <div className="form-header">
              <h2>{modoLogin ? 'Acesse sua conta' : 'Crie sua conta'}</h2>
              <p>
                {modoLogin
                  ? 'Entre para gerenciar pacientes, tutores e consultas.'
                  : 'Preencha os campos abaixo para criar seu cadastro.'}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {!modoLogin && (
                <>
                  <div className="input-group">
                    <label>Nome Completo</label>
                    <div className="input-wrapper">
                      <span className="input-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                          <circle cx="12" cy="8" r="4"></circle>
                          <path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7"></path>
                        </svg>
                      </span>
                      <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Ex: Maria Silva"
                        pattern="[A-Za-zÀ-ÿ\s]+"
                        title="O nome não pode conter números."
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Eu sou um(a):</label>
                    <div className="input-wrapper">
                      <span className="input-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                          <path d="M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"></path>
                          <path d="M8 12h8"></path>
                        </svg>
                      </span>
                      <select value={role} onChange={(e) => handleRoleChange(e.target.value)}>
                        <option value="tutor">Tutor (Cliente)</option>
                        <option value="veterinario">Veterinário</option>
                        <option value="admin">Recepcionista / Admin</option>
                      </select>
                    </div>
                  </div>

                  {role === 'veterinario' && (
                    <div className="input-group">
                      <label>Especialidade Médica</label>
                      <div className="input-wrapper">
                        <span className="input-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                            <path d="M22 10v6"></path>
                            <path d="M2 10l10-5 10 5-10 5-10-5Z"></path>
                            <path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"></path>
                          </svg>
                        </span>
                        <select
                          value={especialidade}
                          onChange={(e) => setEspecialidade(e.target.value)}
                          required
                        >
                          <option value="">Selecione a Especialidade...</option>
                          <option value="Clínica Geral">Clínica Geral</option>
                          <option value="Diagnóstico por Imagem">Diagnóstico por Imagem (Raio-X / Ultrassom)</option>
                          <option value="Cirurgia Geral">Cirurgia Geral</option>
                          <option value="Dermatologia">Dermatologia</option>
                          <option value="Cardiologia">Cardiologia</option>
                          <option value="Oftalmologia">Oftalmologia</option>
                          <option value="Ortopedia">Ortopedia</option>
                          <option value="Anestesiologia">Anestesiologia</option>
                          <option value="Outra">Outra</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="input-group">
                    <label>Telefone</label>
                    <div className="input-wrapper">
                      <span className="input-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                          <path d="M4.5 4h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5L14 13l4 1.5v3a1.5 1.5 0 0 1-1.5 1.5A15.5 15.5 0 0 1 3 4.5 1.5 1.5 0 0 1 4.5 4Z"></path>
                        </svg>
                      </span>
                      <input
                        type="text"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                        placeholder="(00) 00000-0000"
                        minLength={8}
                        maxLength={20}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Endereço</label>
                    <div className="input-wrapper">
                      <span className="input-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                          <path d="M12 21s7-6.2 7-12A7 7 0 0 0 5 9c0 5.8 7 12 7 12Z"></path>
                          <circle cx="12" cy="9" r="2.5"></circle>
                        </svg>
                      </span>
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
                  <span className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                      <path d="m4 7 8 6 8-6"></path>
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Senha</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <rect x="5" y="10" width="14" height="11" rx="2"></rect>
                      <path d="M8 10V7a4 4 0 0 1 8 0v3"></path>
                    </svg>
                  </span>
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    minLength={!modoLogin ? 6 : undefined}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    aria-label="Mostrar senha"
                  >
                    {mostrarSenha ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                        <path d="M3 3l18 18"></path>
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"></path>
                        <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.5 0 9 5.8 9 7s-1.2 3.1-3.7 4.9"></path>
                        <path d="M6.6 7.1C4.2 8.8 3 11.1 3 12c0 1.2 3.5 7 9 7 1 0 2-.2 2.9-.5"></path>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"></path>
                        <circle cx="12" cy="12" r="2.5"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {modoLogin && (
                <div className="form-options">
                  <label className="remember">
                    <input
                      type="checkbox"
                      checked={lembrar}
                      onChange={(e) => setLembrar(e.target.checked)}
                    />
                    <span></span>
                    Lembrar-me
                  </label>
                </div>
              )}

              <button type="submit" className="btn-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M10 17l5-5-5-5"></path>
                  <path d="M15 12H3"></path>
                  <path d="M14 5h5a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5"></path>
                </svg>
                {modoLogin ? 'Entrar' : 'Cadastrar'}
              </button>
            </form>

            <div className="register-link">
              <span>
                {modoLogin
                  ? 'Ainda não tem uma conta?'
                  : 'Já possui uma conta?'}
              </span>
              <button
                type="button"
                onClick={() => setModoLogin(!modoLogin)}
              >
                {modoLogin ? 'cadastre-se' : 'Faça login'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}