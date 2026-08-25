import { useEffect, useState, type FormEvent } from 'react';
import { CalendarDays, Cat, Dog, Edit3, PawPrint, Trash2, UserRound, Weight } from 'lucide-react';
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
  const [formData, setFormData] = useState<Pet>({ nome: '', especie: '', raca: '', idade: '', tutorId: '' });

  const carregarDados = async () => {
    try {
      const [resPets, resTutores] = await Promise.all([api.get('/pets'), api.get('/tutores')]);
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
      if (editingId) await api.put(`/pets/${editingId}`, formData);
      else await api.post('/pets', formData);
      limparFormulario();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar pet:', error);
    }
  };
  const handleEdit = (pet: Pet) => {
    setEditingId(pet._id || null);
    setFormData({ nome: pet.nome, especie: pet.especie, raca: pet.raca, idade: pet.idade, tutorId: typeof pet.tutorId === 'object' ? pet.tutorId._id : pet.tutorId });
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
  const getPetIcon = (especie: string) => {
    const especieNormalizada = especie.toLowerCase();
    if (especieNormalizada.includes('gato') || especieNormalizada.includes('felino')) return <Cat size={18} />;
    if (especieNormalizada.includes('cão') || especieNormalizada.includes('cao') || especieNormalizada.includes('cachorro')) return <Dog size={18} />;
    return <PawPrint size={18} />;
  };
  return (
    <div className="pets-container">
      <section className="hero-banner">
        <div className="hero-content">
          <h1 className="page-title">Gestão de Pacientes</h1>
          <p className="hero-subtitle">Cadastre novos animais, vincule aos seus tutores responsáveis e acompanhe os dados dos pacientes da clínica.</p>
        </div>
        <div className="hero-image-wrapper">
          <div className="hero-circle"></div>
          <div className="decor-cross cross-1">+</div>
          <div className="decor-cross cross-2">+</div>
          <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600" alt="Pet Paciente" className="pet-hero-img" />
        </div>
      </section>
      <section className="form-section">
        <div className="section-header">
          <h2>{editingId ? 'Editar Paciente' : 'Cadastrar Novo Paciente'}</h2>
          <p>Informe os dados do animal e vincule o tutor responsável.</p>
        </div>
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="input-group">
              <label>Nome do Pet*</label>
              <div className="input-wrapper">
                <PawPrint className="input-icon" size={17} />
                <input type="text" required placeholder="Ex: Thor, Meg, Mel" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
              </div>
            </div>
            <div className="input-group">
              <label>Tutor Responsável*</label>
              <div className="input-wrapper">
                <UserRound className="input-icon" size={17} />
                <select required value={typeof formData.tutorId === 'object' ? formData.tutorId._id : formData.tutorId} onChange={(e) => setFormData({ ...formData, tutorId: e.target.value })}>
                  <option value="">Selecione um Tutor...</option>
                  {tutores.map((tutor) => <option key={tutor._id} value={tutor._id}>{tutor.nome}</option>)}
                </select>
              </div>
            </div>
            <div className="input-group">
              <label>Espécie*</label>
              <div className="input-wrapper">
                <PawPrint className="input-icon" size={17} />
                <input type="text" required placeholder="Ex: Cão, Gato, Felino..." value={formData.especie} onChange={(e) => setFormData({ ...formData, especie: e.target.value })} />
              </div>
            </div>
            <div className="input-group">
              <label>Raça*</label>
              <div className="input-wrapper">
                <Dog className="input-icon" size={17} />
                <input type="text" required placeholder="Ex: Poodle, SRD, Persa" value={formData.raca} onChange={(e) => setFormData({ ...formData, raca: e.target.value })} />
              </div>
            </div>
            <div className="input-group">
              <label>Idade (anos)*</label>
              <div className="input-wrapper">
                <CalendarDays className="input-icon" size={17} />
                <input type="number" min="0" required placeholder="Ex: 3" value={formData.idade} onChange={(e) => setFormData({ ...formData, idade: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="form-actions">
            {editingId && <button type="button" className="btn-secondary" onClick={limparFormulario}>Limpar</button>}
            <button type="submit" className="btn-primary">{editingId ? 'Atualizar Paciente' : 'Salvar Paciente'}</button>
          </div>
        
        
        </form>
      </section>
      <section className="table-section">
        <div className="table-card">
          <div className="table-header">
            <div>
              <h3>Pacientes Cadastrados</h3>
              <p>Visualize, edite ou acesse o perfil dos pacientes cadastrados.</p>
            </div>
            <span className="total-badge">{pets.length} pacientes</span>
          </div>
          <div className="table-wrapper">
            <table className="pets-table">
              <thead>
                <tr>
                  <th>PACIENTE</th>
                  <th>ESPÉCIE / RAÇA</th>
                  <th>IDADE</th>
                  <th>TUTOR</th>
                  <th>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {pets.map((pet) => (
                  <tr key={pet._id}>
                    <td>
                      <div className="pet-info">
                        <div className="pet-avatar">{getPetIcon(pet.especie)}</div>
                        <div>
                          <strong>{pet.nome}</strong>
                         
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="species-info">
                        <span className="badge-especie">{pet.especie}</span>
                        <small>{pet.raca}</small>
                      </div>
                    </td>
                    <td>
                      <div className="age-info">
                        <CalendarDays size={15} />
                        <span>{pet.idade} ano(s)</span>
                      </div>
                    </td>
                    <td>
                      <div className="tutor-info">
                        <UserRound size={15} />
                        <span>{typeof pet.tutorId === 'object' && pet.tutorId !== null ? pet.tutorId.nome : 'Tutor não encontrado'}</span>
                      </div>
                    </td>
                    <td className="actions-cell">
                      <button className="btn-edit" title="Editar" onClick={() => handleEdit(pet)}><Edit3 size={16} /></button>
                      <button className="btn-delete" title="Excluir" onClick={() => handleDelete(pet._id!)}><Trash2 size={16} /></button>
                      <button className="btn-ver-ficha" onClick={() => { window.location.href = `/perfil-pet/${pet._id}`; }}>Ver Perfil</button>
                    </td>
                  </tr>
                ))}
                {pets.length === 0 && (
                  <tr><td colSpan={5} className="empty-state">Nenhum paciente cadastrado até o momento.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}