import { useEffect, useState, type FormEvent } from 'react';
import api from '../../services/api';
import './Veterinarios.scss';
import {
  User,
  Mail,
  GraduationCap,
  Phone,
  MapPin,
  Lock,
  Stethoscope,
  Pencil,
  Trash2,
} from 'lucide-react';

interface Usuario {
  _id: string;
  nome: string;
  email: string;
  telefone?: string;
  endereco?: string;
  especialidade?: string;
  role: string;
}

const FORM_VAZIO = {
  nome: '',
  email: '',
  telefone: '',
  endereco: '',
  especialidade: '',
  senha: '',
};

export default function Veterinarios() {
  const [veterinarios, setVeterinarios] = useState<Usuario[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [formData, setFormData] = useState(FORM_VAZIO);

  const carregarVeterinarios = async () => {
    try {
      const res = await api.get('/usuarios');
      const apenasVets = res.data.filter((u: Usuario) => u.role === 'veterinario');
      setVeterinarios(apenasVets);
    } catch (error) {
      console.error('Erro ao carregar veterinários:', error);
    }
  };

  useEffect(() => {
    carregarVeterinarios();
  }, []);

  const validarFormulario = () => {
    const nome = formData.nome.trim();
    const letrasNome = (nome.match(/[A-Za-zÀ-ÿ]/g) || []).length;
    const telefone = formData.telefone.trim();
    const endereco = formData.endereco.trim();
    const letrasEndereco = (endereco.match(/[A-Za-zÀ-ÿ]/g) || []).length;

    if (!/^[A-Za-zÀ-ÿ\s]+$/.test(nome)) return 'O nome não pode conter números ou símbolos.';
    if (letrasNome < 4) return 'O nome deve ter no mínimo 4 letras.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) return 'E-mail em formato inválido.';
    if (!formData.especialidade) return 'Selecione a especialidade médica.';
    if (telefone.length < 8 || telefone.length > 20) {
      return 'O telefone é obrigatório e deve ter entre 8 e 20 caracteres.';
    }
    if (!endereco) return 'O endereço é obrigatório.';
    if (letrasEndereco < 8) return 'O endereço deve ter no mínimo 8 letras.';
    if (!editingId && !formData.senha) return 'Informe a senha de acesso.';
    if (formData.senha && formData.senha.length < 6) return 'A senha deve ter no mínimo 6 caracteres.';
    return '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (salvando) return;

    const mensagem = validarFormulario();
    if (mensagem) {
      alert(mensagem);
      return;
    }

    const payload: Record<string, any> = {
      nome: formData.nome.trim(),
      email: formData.email.trim().toLowerCase(),
      telefone: formData.telefone.trim(),
      endereco: formData.endereco.trim(),
      especialidade: formData.especialidade,
      senha: formData.senha,
      role: 'veterinario',
    };
    if (editingId && !formData.senha) {
      delete payload.senha;
    }

    setSalvando(true);
    try {
      if (editingId) {
        await api.put(`/usuarios/${editingId}`, payload);
        alert('Dados do veterinário atualizados com sucesso!');
      } else {
        await api.post('/usuarios', payload);
        alert('Veterinário cadastrado com sucesso!');
      }
      limparFormulario();
      carregarVeterinarios();
    } catch (error: any) {
      console.error('Erro ao salvar veterinário:', error);
      const msg = error.response?.data?.erro || error.response?.data?.message || 'Erro ao conectar ao servidor.';
      alert(`Erro: ${msg}`);
    } finally {
      setSalvando(false);
    }
  };

  const handleEdit = (vet: Usuario) => {
    setEditingId(vet._id);
    setFormData({
      nome: vet.nome || '',
      email: vet.email || '',
      telefone: vet.telefone || '',
      endereco: vet.endereco || '',
      especialidade: vet.especialidade || '',
      senha: '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este veterinário?')) {
      try {
        await api.delete(`/usuarios/${id}`);
        await carregarVeterinarios();
      } catch (error: any) {
        console.error('Erro ao deletar veterinário:', error);
        alert(error.response?.data?.message || 'Não foi possível excluir o usuário.');
      }
    }
  };

  const limparFormulario = () => {
    setEditingId(null);
    setFormData(FORM_VAZIO);
  };

  return (
    <div className="veterinarios-container">
      <section className="hero-banner">
        <div className="hero-content">
          <h1 className="page-title">Corpo Clínico & Veterinários</h1>
          <p className="hero-subtitle">Cadastre novos profissionais, defina especialidades médicas e mantenha os dados da sua equipe clínica atualizados.</p>
        </div>
        <div className="hero-image-wrapper">
          <div className="decor-shape"></div>
          <div className="decor-cross cross-1">+</div>
          <div className="decor-cross cross-2">+</div>
          <img src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=600" alt="Corpo Clínico Veterinário" className="pet-hero-img" />
        </div>
      </section>
      <section className="form-section">
        <div className="section-header">
          <h2>{editingId ? 'Editar Veterinário' : 'Cadastrar Novo Veterinário'}</h2>
          <p>Preencha as informações do profissional de saúde abaixo.</p>
        </div>
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="input-group">
              <label>Nome Completo*</label>
              <div className="input-wrapper">
                <User className="input-icon" size={17} />
                <input type="text" required maxLength={100} placeholder="Ex: Roberto Silva" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
              </div>
            </div>
            <div className="input-group">
              <label>E-mail (Login)*</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={17} />
                <input type="email" required maxLength={100} placeholder="roberto.vet@clinica.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>
            <div className="input-group">
              <label>Especialidade Médica*</label>
              <div className="input-wrapper">
                <GraduationCap className="input-icon" size={17} />
                <select required value={formData.especialidade} onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}>
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
            <div className="input-group">
              <label>Telefone / WhatsApp*</label>
              <div className="input-wrapper">
                <Phone className="input-icon" size={17} />
                <input type="tel" required maxLength={20} placeholder="(11) 99999-9999" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} />
              </div>
            </div>
            <div className="input-group full-width">
              <label>Endereço*</label>
              <div className="input-wrapper">
                <MapPin className="input-icon" size={17} />
                <input type="text" required placeholder="Rua, Número, Bairro" value={formData.endereco} onChange={(e) => setFormData({ ...formData, endereco: e.target.value })} />
              </div>
            </div>
            <div className="input-group full-width">
              <label>{editingId ? 'Nova Senha (deixe em branco para não alterar)' : 'Senha de Acesso*'}</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={17} />
                <input type="password" required={!editingId} maxLength={72} placeholder={editingId ? 'Digite apenas se quiser mudar a senha' : 'Mínimo de 6 caracteres'} value={formData.senha} onChange={(e) => setFormData({ ...formData, senha: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={limparFormulario}>Limpar</button>
            <button type="submit" className="btn-primary" disabled={salvando}>
              {salvando ? 'Salvando...' : editingId ? 'Atualizar Dados' : 'Cadastrar Veterinário'}
            </button>
          </div>
        </form>
      </section>
      <section className="table-section">
        <div className="table-card">
          <div className="table-header">
            <div>
              <h3>Veterinários Cadastrados</h3>
              <p>Visualize, edite ou remova os profissionais cadastrados.</p>
            </div>
          </div>
          <div className="table-responsive">
            <table className="consultas-table">
              <thead>
                <tr>
                  <th>NOME</th>
                  <th>ESPECIALIDADE</th>
                  <th>E-MAIL</th>
                  <th>TELEFONE</th>
                  <th>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {veterinarios.map((vet) => (
                  <tr key={vet._id}>
                    <td>
                      <div className="vet-name">
                        <span className="vet-avatar">
                          <Stethoscope size={16} />
                        </span>
                        <div>
                          <strong>Dr(a). {vet.nome}</strong>
                          <small>Veterinário</small>
                        </div>
                      </div>
                    </td>
                    <td><span className="type-badge">{vet.especialidade || 'Clínica Geral'}</span></td>
                    <td>{vet.email}</td>
                    <td>{vet.telefone || '-'}</td>
                    <td className="actions-cell">
                      <button className="btn-edit" onClick={() => handleEdit(vet)} title="Editar">
                        <Pencil size={15} />
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(vet._id)} title="Excluir">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {veterinarios.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty-state">Nenhum veterinário cadastrado no sistema.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}