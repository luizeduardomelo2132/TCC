import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './DefinirNovaSenha.scss';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, Sun, Moon } from 'lucide-react';

const THEME_STORAGE_KEY = '@TCC:theme';

export default function DefinirNovaSenha() {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [erro, setErro] = useState('');
  const [temaEscuro, setTemaEscuro] = useState(false);
  const navigate = useNavigate();

  // Mesma lógica de tema usada na tela de Login, já que esta também
  // é exibida antes do usuário chegar à área com topbar.
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');

    if (novaSenha.length < 6) {
      setErro('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    try {
      await api.put('/usuarios/definir-nova-senha', { novaSenha });

      alert('Senha definida com sucesso! Faça login novamente.');

      // Limpa a sessão para forçar um novo login já com a senha definitiva
      localStorage.removeItem('@TCC:token');
      localStorage.removeItem('@TCC:id');
      localStorage.removeItem('@TCC:role');
      localStorage.removeItem('@TCC:nome');

      navigate('/login');
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.erro || 'Erro ao definir nova senha.';
      setErro(msg);
    }
  };

  return (
    <div className="dsenha-container">
      <div className="dsenha-decor-circle dsenha-decor-circle--top"></div>
      <div className="dsenha-decor-circle dsenha-decor-circle--bottom"></div>
      <span className="dsenha-decor-cross dsenha-decor-cross--one">+</span>
      <span className="dsenha-decor-cross dsenha-decor-cross--two">+</span>

      <button
        type="button"
        className="dsenha-theme-toggle"
        onClick={alternarTema}
        aria-label={temaEscuro ? 'Ativar modo claro' : 'Ativar modo escuro'}
        title={temaEscuro ? 'Ativar modo claro' : 'Ativar modo escuro'}
      >
        {temaEscuro ? <Sun /> : <Moon />}
      </button>

      <div className="dsenha-card">
        <div className="dsenha-logo">
          <div className="dsenha-logo-symbol">
            <svg viewBox="0 0 70 80" fill="none">
              <path d="M35 2L61 20V52L35 77L9 52V20L35 2Z" fill="#80976B" />
              <path d="M35 12L52 25V48L35 64L18 48V25L35 12Z" fill="#F7F5ED" />
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
          <div className="dsenha-logo-text">
            <strong>Clínica Maximus</strong>
            <span>SAÚDE ANIMAL</span>
          </div>
        </div>

        <div className="dsenha-header">
          <h2>Defina sua nova senha</h2>
          <p>
            Este é seu primeiro acesso. Por segurança, defina uma senha
            pessoal antes de continuar.
          </p>
        </div>

        <form className="dsenha-form" onSubmit={handleSubmit}>
          <div className="dsenha-input-group">
            <label>Nova Senha</label>
            <div className="dsenha-input-wrapper">
              <span className="dsenha-input-icon">
                <Lock size={17} />
              </span>
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="dsenha-password-toggle"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                aria-label="Mostrar senha"
              >
                {mostrarSenha ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div className="dsenha-input-group">
            <label>Confirmar Nova Senha</label>
            <div className="dsenha-input-wrapper">
              <span className="dsenha-input-icon">
                <Lock size={17} />
              </span>
              <input
                type={mostrarConfirmar ? 'text' : 'password'}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="dsenha-password-toggle"
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                aria-label="Mostrar senha"
              >
                {mostrarConfirmar ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div className="dsenha-security-note">
            <ShieldCheck size={17} />
            <p>
              Utilize uma senha segura com pelo menos 6 caracteres,
              combinando letras e números.
            </p>
          </div>

          {erro && (
            <div className="dsenha-error">
              <AlertCircle size={17} />
              <p>{erro}</p>
            </div>
          )}

          <button type="submit" className="dsenha-submit-btn">
            <ShieldCheck size={16} />
            Salvar Nova Senha
          </button>
        </form>
      </div>
    </div>
  );
}