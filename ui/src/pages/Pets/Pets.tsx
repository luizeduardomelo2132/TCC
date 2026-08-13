import { useEffect, useState, type FormEvent } from 'react';
import api from '../../services/api';
import './Pets.scss';

interface Tutor {
  _id: string;
  nome: string;
}

interface Pet {
  _id?: string;
  nome: string;
  especie: string;
  raca: string;
  idade: number | string;
  tutorId: Tutor | string;
}

export default function Pets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Pet>({
    nome: '',
    especie: '',
    raca: '',
    idade: '',
    tutorId: '',
  });

  const carregarDados = async () => {
    try {
      const [resPets, resTutores] = await Promise.all([
        api.get('/pets'),
        api.get('/tutores'),
      ]);
      setPets(resPets.data);
      setTutores(resTutores.data);
    } catch (error) {
      console.error('Erro ao carregar dados de Pets/Tutores:', error);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/pets/${editingId}`, formData);
      } else {
        await api.post('/pets', formData);
      }
      limparFormulario();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar pet:', error);
    }
  };

  const handleEdit = (pet: Pet) => {
    setEditingId(pet._id || null);
    setFormData({
      nome: pet.nome,
      especie: pet.especie,
      raca: pet.raca,
      idade: pet.idade,
      tutorId: typeof pet.tutorId === 'object' ? pet.tutorId._id : pet.tutorId,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este paciente (pet)?')) {
      try {
        await api.delete(`/pets/${id}`);
        carregarDados();
      } catch (error) {
        console.error('Erro ao deletar pet:', error);
      }
    }
  };

  const limparFormulario = () => {
    setEditingId(null);
    setFormData({ nome: '', especie: '', raca: '', idade: '', tutorId: '' });
  };

  return (
    <div className="pets-container">
      {/* SEÇÃO HERO ILUSTRATIVA (Estilo Landing Page das referências) */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1 className="page-title">Gestão de Pacientes & Pets</h1>
          <p className="hero-subtitle">
            Cadastre novos animais, vincule aos seus tutores responsáveis e acompanhe o histórico médico do seu paciente.
          </p>
        </div>

        <div className="hero-image-wrapper">
          <div className="decor-shape shape-triangle"></div>
          <div className="decor-cross cross-1">+</div>
          <div className="decor-cross cross-2">+</div>
          <img
            src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600"
            alt="Pet Paciente"
            className="pet-hero-img"
          />
        </div>
      </section>

      {/* CARD DO FORMULÁRIO */}
      <section className="form-section">
        <div className="section-header">
          <h2>{editingId ? 'Editar Paciente' : ' Novo Cadastramento'}</h2>
          <p>Preencha os campos abaixo para salvar na base de dados.</p>
        </div>

        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="input-group">
              <label>Nome do Pet*</label>
              <div className="input-wrapper">
                <span className="input-icon">🐾</span>
                <input
                  type="text"
                  required
                  placeholder="Ex: Thor, Meg, Mel"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Tutor Responsável*</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <select
                  required
                  value={typeof formData.tutorId === 'object' ? formData.tutorId._id : formData.tutorId}
                  onChange={(e) => setFormData({ ...formData, tutorId: e.target.value })}
                >
                  <option value="">Selecione um Tutor...</option>
                  {tutores.map((tutor) => (
                    <option key={tutor._id} value={tutor._id}>
                      {tutor.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Espécie*</label>
              <div className="input-wrapper">
                <span className="input-icon">🏷️</span>
                <input
                  type="text"
                  placeholder="Ex: Cão, Gato, Felino..."
                  required
                  value={formData.especie}
                  onChange={(e) => setFormData({ ...formData, especie: e.target.value })}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Raça*</label>
              <div className="input-wrapper">
                <span className="input-icon">✨</span>
                <input
                  type="text"
                  placeholder="Ex: Poodle, SRD, Persa"
                  required
                  value={formData.raca}
                  onChange={(e) => setFormData({ ...formData, raca: e.target.value })}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Idade (anos)*</label>
              <div className="input-wrapper">
                <span className="input-icon">🎂</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Ex: 3"
                  required
                  value={formData.idade}
                  onChange={(e) => setFormData({ ...formData, idade: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            {editingId && (
              <button type="button" className="btn-secondary" onClick={limparFormulario}>
                Cancelar Edição
              </button>
            )}
            <button type="submit" className="btn-primary">
              {editingId ? 'Atualizar Registro' : 'Salvar Paciente'}
            </button>
          </div>
        </form>
      </section>

      {/* TABELA DE PACIENTES */}
      <section className="table-section">
        <div className="table-card">
          <div className="table-header">
            <h3>Pacientes Cadastrados ({pets.length})</h3>
          </div>
          <table className="pets-table">
            <thead>
              <tr>
                <th>Nome do Paciente</th>
                <th>Espécie / Raça</th>
                <th>Idade</th>
                <th>Tutor Responsável</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pets.map((pet) => (
                <tr key={pet._id}>
                  <td className="pet-name-td">
                    <span className="pet-avatar">🐶</span>
                    <strong>{pet.nome}</strong>
                  </td>
                  <td>
                    <span className="badge-especie">{pet.especie}</span>
                    <small className="raca-sub">{pet.raca}</small>
                  </td>
                  <td>{pet.idade} ano(s)</td>
                  <td>
                    {typeof pet.tutorId === 'object' && pet.tutorId !== null
                      ? pet.tutorId.nome
                      : 'Tutor não encontrado'}
                  </td>
                  <td className="actions-cell">
                    <button className="btn-edit" onClick={() => handleEdit(pet)}>Editar</button>
                    <button className="btn-delete" onClick={() => handleDelete(pet._id!)}>Excluir</button>
                  </td>
                </tr>
              ))}
              {pets.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-state">
                    Nenhum paciente cadastrado até o momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}