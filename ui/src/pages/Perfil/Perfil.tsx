import { useState, useEffect } from 'react';
import api from '../../services/api';
import './Perfil.scss';

export default function Perfil() {
  // Estados para os Dados Pessoais (LÓGICA INTACTA)
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  
  // Estados para a Segurança (LÓGICA INTACTA)
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
      {/* NOVO CABEÇALHO INSPIRADO NO DESIGN DA HOME */}
      <div className="perfil-hero">
        <div className="hero-text">
          <h1>Meu Perfil</h1>
          <p>Gerencie suas informações pessoais e configurações de segurança com a mesma dedicação que temos com o seu pet.</p>
        </div>
        <div className="hero-image">
          <img 
            src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800" 
            alt="Cachorro fofo olhando para cima" 
          />
        </div>
      </div>

      <div className="perfil-grid">
        {/* COLUNA 1: DADOS PESSOAIS */}
        <section className="perfil-card">
          <div className="card-header">
            <h2>Dados Pessoais</h2>
            <span className="role-badge">{userRole.toUpperCase()}</span>
          </div>

          <form onSubmit={handleSalvarDados}>
            <div className="input-group">
              <label>Nome Completo</label>
              <input 
                type="text" 
                value={nome} 
                onChange={(e) => setNome(e.target.value)} 
                required 
              />
            </div>

            <div className="input-group">
              <label>E-mail</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            <div className="input-group">
              <label>Telefone</label>
              <input 
                type="text" 
                value={telefone} 
                onChange={(e) => setTelefone(e.target.value)} 
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="input-group">
              <label>Endereço</label>
              <input 
                type="text" 
                value={endereco} 
                onChange={(e) => setEndereco(e.target.value)} 
                placeholder="Rua, Número, Bairro"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        </section>

        {/* COLUNA 2: SEGURANÇA */}
        <section className="perfil-card">
          <div className="card-header">
            <h2>Segurança</h2>
          </div>

          <form onSubmit={handleTrocarSenha}>
            <div className="input-group">
              <label>Senha Atual</label>
              <input 
                type="password" 
                value={senhaAtual} 
                onChange={(e) => setSenhaAtual(e.target.value)} 
                placeholder="••••••••"
              />
            </div>

            <div className="input-group">
              <label>Nova Senha</label>
              <input 
                type="password" 
                value={novaSenha} 
                onChange={(e) => setNovaSenha(e.target.value)} 
                placeholder="Nova senha forte"
              />
            </div>

            <button type="submit" className="btn-secondary">
              Atualizar Senha
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}