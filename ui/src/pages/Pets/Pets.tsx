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
      <h1 className="page-title">Gestão de Pacientes / Pets (RF02)</h1>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="input-group">
            <label>Nome do Pet*</label>
            <input
              type="text"
              required
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>Tutor Responsável*</label>
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

          <div className="input-group">
            <label>Espécie*</label>
            <input
              type="text"
              placeholder="Ex: Cão, Gato..."
              required
              value={formData.especie}
              onChange={(e) => setFormData({ ...formData, especie: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>Raça*</label>
            <input
              type="text"
              required
              value={formData.raca}
              onChange={(e) => setFormData({ ...formData, raca: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>Idade (anos)*</label>
            <input
              type="number"
              min="0"
              required
              value={formData.idade}
              onChange={(e) => setFormData({ ...formData, idade: e.target.value })}
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
            {editingId ? 'Atualizar Pet' : 'Cadastrar Pet'}
          </button>
        </div>
      </form>

      <div className="table-card">
        <table className="pets-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Espécie / Raça</th>
              <th>Idade</th>
              <th>Tutor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pets.map((pet) => (
              <tr key={pet._id}>
                <td>{pet.nome}</td>
                <td>{pet.especie} - <small>{pet.raca}</small></td>
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
                <td colSpan={5} style={{ textAlign: 'center' }}>Nenhum pet cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}