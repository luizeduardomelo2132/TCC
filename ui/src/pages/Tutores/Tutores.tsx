import { useEffect, useState, type FormEvent } from 'react';
import api from '../../services/api';
import './Tutores.scss';

interface Tutor {
  _id?: string;
  nome: string;
  email: string;
  telefone: string;
  endereco?: string;
}

export default function Tutores() {
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estado do formulário
  const [formData, setFormData] = useState<Tutor>({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
  });

  // Carregar tutores da API
  const carregarTutores = () => {
    api.get('/tutores')
      .then((res) => setTutores(res.data))
      .catch((err) => console.error('Erro ao buscar tutores:', err));
  };

  useEffect(() => {
    carregarTutores();
  }, []);

  // Salvar (Criar ou Atualizar)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/tutores/${editingId}`, formData);
      } else {
        await api.post('/tutores', formData);
      }
      limparFormulario();
      carregarTutores();
    } catch (error) {
      console.error('Erro ao salvar tutor:', error);
    }
  };

  // Preencher formulário para Edição
  const handleEdit = (tutor: Tutor) => {
    setEditingId(tutor._id || null);
    setFormData({
      nome: tutor.nome,
      email: tutor.email,
      telefone: tutor.telefone,
      endereco: tutor.endereco || '',
    });
  };

  // Excluir Tutor
  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este tutor?')) {
      try {
        await api.delete(`/tutores/${id}`);
        carregarTutores();
      } catch (error) {
        console.error('Erro ao deletar tutor:', error);
      }
    }
  };

  const limparFormulario = () => {
    setEditingId(null);
    setFormData({ nome: '', email: '', telefone: '', endereco: '' });
  };

  return (
    <div className="tutores-container">
      <h1 className="page-title">Gestão de Tutores (RF01)</h1>

      {/* Formulário de Cadastro / Edição */}
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="input-group">
            <label>Nome Completo*</label>
            <input
              type="text"
              required
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>E-mail*</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>Telefone*</label>
            <input
              type="text"
              required
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>Endereço</label>
            <input
              type="text"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
            />
          </div>
        </div>

        <div className="form-actions">
          {editingId && (
            <button type="button" className="btn-secondary" onClick={limparFormulario}>
              Cancelar
            </button>
          )}
          <button type="submit" className="btn-primary">
            {editingId ? 'Atualizar Tutor' : 'Cadastrar Tutor'}
          </button>
        </div>
      </form>

      {/* Tabela de Exibição */}
      <div className="table-card">
        <table className="tutores-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Contato</th>
              <th>Endereço</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {tutores.map((tutor) => (
              <tr key={tutor._id}>
                <td>{tutor.nome}</td>
                <td>{tutor.email}<br /><small>{tutor.telefone}</small></td>
                <td>{tutor.endereco || '-'}</td>
                <td className="actions-cell">
                  <button className="btn-edit" onClick={() => handleEdit(tutor)}>Editar</button>
                  <button className="btn-delete" onClick={() => handleDelete(tutor._id!)}>Excluir</button>
                </td>
              </tr>
            ))}
            {tutores.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center' }}>Nenhum tutor cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}