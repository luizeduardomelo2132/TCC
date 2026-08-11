import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Login.scss';

export default function Login() {
  const [modoLogin, setModoLogin] = useState(true);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState('tutor'); 
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (modoLogin) {
        const response = await api.post('/auth/login', { email, senha });
        
        // salva o token e o cargo do usuario no navegador
        localStorage.setItem('@TCC:token', response.data.token);
        localStorage.setItem('@TCC:role', response.data.usuario.role);
        
        navigate('/');
        window.location.reload();
      } else {
        // envia o role escolhido na hora do cadastro
        await api.post('/auth/registrar', { nome, email, senha, role });
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
      <div className="login-card">
        <h1 className="brand">🐾 Clínica Vet</h1>
        <h2>{modoLogin ? 'Acesse sua conta' : 'Crie sua conta'}</h2>

        <form onSubmit={handleSubmit}>
          {!modoLogin && (
            <>
              <div className="input-group">
                <label>Nome Completo</label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Eu sou um(a):</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="tutor">Tutor (Cliente)</option>
                  <option value="veterinario">Veterinário</option>
                  <option value="admin">Recepcionista / Admin</option>
                </select>
              </div>
            </>
          )}

          <div className="input-group">
            <label>E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="input-group">
            <label>Senha</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
          </div>

          <button type="submit" className="btn-primary">
            {modoLogin ? 'Entrar no Sistema' : 'Cadastrar'}
          </button>
        </form>

        <div className="toggle-mode">
          {modoLogin ? 'Ainda não tem conta?' : 'Já possui uma conta?'}
          <button type="button" onClick={() => setModoLogin(!modoLogin)}>
            {modoLogin ? 'Cadastre-se' : 'Faça login'}
          </button>
        </div>
      </div>
    </div>
  );
}