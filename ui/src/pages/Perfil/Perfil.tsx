import { useState, useEffect } from 'react';
import api from '../../services/api';
import './Perfil.scss';
import { User, Mail, Phone, MapPin, Check, ShieldCheck, KeyRound, Lock } from 'lucide-react';

const contarLetras = (texto: string) => (texto.match(/[A-Za-zÀ-ÿ]/g) || []).length;

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

    if (contarLetras(nome) < 4) {
      alert('O nome deve ter no mínimo 4 letras.');
      return;
    }

    if (endereco && contarLetras(endereco) < 8) {
      alert('O endereço deve ter no mínimo 8 letras.');
      return;
    }

    setIsLoading(true);
    try {
      await api.put('/usuarios/atualizar-perfil', { nome, email, telefone, endereco });
      alert('Dados pessoais atualizados com sucesso!');
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.erro || 'Erro ao atualizar os dados. Tente novamente.';
      alert(msg);
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

    if (novaSenha.length < 6) {
      alert('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    try {
      await api.put('/usuarios/trocar-senha', { senhaAtual, novaSenha });
      alert('Senha atualizada com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.erro || 'Erro ao trocar a senha. Verifique se a senha atual está correta.';
      alert(msg);
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
                  <User className="input-icon" size={17} />
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Digite seu nome completo"
                    pattern="[A-Za-zÀ-ÿ\s]+"
                    title="O nome não pode conter números ou símbolos."
                    required
                  />
                </div>
              </div>
              <div className="input-group">
                <label>E-mail*</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={17} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@email.com"
                    pattern="[A-Za-zÀ-ÿ]{3,}[A-Za-zÀ-ÿ0-9._%+-]*@[^\s@]+\.[^\s@]+"
                    title="O e-mail deve começar com pelo menos 3 letras antes do @."
                    required
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Telefone</label>
                <div className="input-wrapper">
                  <Phone className="input-icon" size={17} />
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    minLength={8}
                    maxLength={20}
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Endereço</label>
                <div className="input-wrapper">
                  <MapPin className="input-icon" size={17} />
                  <input
                    type="text"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Rua, Número, Bairro"
                  />
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={isLoading}>
                <Check size={15} />
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
            <div className="header-icon">
              <Lock size={17} />
            </div>
          </div>
          <form onSubmit={handleTrocarSenha}>
            <div className="input-group">
              <label>Senha Atual*</label>
              <div className="input-wrapper">
                <KeyRound className="input-icon" size={17} />
                <input type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} placeholder="Digite sua senha atual" required />
              </div>
            </div>
            <div className="input-group">
              <label>Nova Senha*</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={17} />
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Digite uma nova senha"
                  minLength={6}
                  required
                />
              </div>
            </div>
            <div className="security-info">
              <ShieldCheck size={17} />
              <p>Utilize uma senha segura com pelo menos 6 caracteres, combinando letras e números.</p>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                <Check size={15} />
                Atualizar Senha
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}