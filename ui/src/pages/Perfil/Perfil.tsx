import { useState, useEffect } from 'react';
import api from '../../services/api';
import './Perfil.scss';
export default function Perfil() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const userRole = localStorage.getItem('@TCC:role') || 'tutor';
  useEffect(() => {
    const carregarPerfil = async () => {
      try {
        const response = await api.get('/usuarios/meu-perfil');
        setNome(response.data.nome || '');
        setEmail(response.data.email || '');
        setTelefone(response.data.telefone || '');
        setEndereco(response.data.endereco || '');
      } catch (error) {
        console.error('Erro ao buscar dados do perfil:', error);
        setNome('Usuário Teste');
        setEmail('usuario@email.com');
      }
    };
    carregarPerfil();
  }, []);
  const handleSalvarDados = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.put('/usuarios/atualizar-perfil', { nome, email, telefone, endereco });
      alert('Dados pessoais atualizados com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar os dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleTrocarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senhaAtual || !novaSenha) {
      alert('Preencha a senha atual e a nova senha.');
      return;
    }
    try {
      await api.put('/usuarios/trocar-senha', { senhaAtual, novaSenha });
      alert('Senha atualizada com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
    } catch (error) {
      console.error(error);
      alert('Erro ao trocar a senha. Verifique se a senha atual está correta.');
    }
  };
  return (
    <div className="perfil-container">
      <section className="perfil-hero">
        <div className="hero-decoration hero-circle"></div>
        <div className="hero-decoration hero-circle-small"></div>
        <div className="hero-cross cross-one">+</div>
        <div className="hero-cross cross-two">+</div>
        <div className="hero-text">
          <h1>Meu Perfil</h1>
          <p>Gerencie suas informações pessoais e configurações de segurança para manter seus dados sempre atualizados.</p>
        </div>
        <div className="hero-image">
          <div className="hero-image-circle">
            <img src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800" alt="Cachorro da clínica" />
          </div>
        </div>
      </section>
      <div className="perfil-grid">
        <section className="perfil-card dados-card">
          <div className="card-header">
            <div>
              <h2>Dados Pessoais</h2>
              <p>Atualize suas informações de cadastro.</p>
            </div>
            <span className="role-badge">{userRole.toUpperCase()}</span>
          </div>
          <form onSubmit={handleSalvarDados}>
            <div className="form-grid">
              <div className="input-group">
                <label>Nome Completo*</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Digite seu nome completo" required />
                </div>
              </div>
              <div className="input-group">
                <label>E-mail*</label>
                <div className="input-wrapper">
                  <span className="input-icon">✉️</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@email.com" required />
                </div>
              </div>
              <div className="input-group">
                <label>Telefone</label>
                <div className="input-wrapper">
                  <span className="input-icon">📞</span>
                  <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" />
                </div>
              </div>
              <div className="input-group">
                <label>Endereço</label>
                <div className="input-wrapper">
                  <span className="input-icon">📍</span>
                  <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua, Número, Bairro" />
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={isLoading}>
                <span>✓</span>
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </section>
        <section className="perfil-card seguranca-card">
          <div className="card-header">
            <div>
              <h2>Segurança da Conta</h2>
              <p>Altere sua senha de acesso ao sistema.</p>
            </div>
            <div className="header-icon">🔒</div>
          </div>
          <form onSubmit={handleTrocarSenha}>
            <div className="input-group">
              <label>Senha Atual*</label>
              <div className="input-wrapper">
                <span className="input-icon">🔑</span>
                <input type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} placeholder="Digite sua senha atual" required />
              </div>
            </div>
            <div className="input-group">
              <label>Nova Senha*</label>
              <div className="input-wrapper">
                <span className="input-icon">🔐</span>
                <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="Digite uma nova senha" required />
              </div>
            </div>
            <div className="security-info">
              <span>🛡️</span>
              <p>Utilize uma senha segura com pelo menos 6 caracteres, combinando letras e números.</p>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                <span>✓</span>
                Atualizar Senha
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}