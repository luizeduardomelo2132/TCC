import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Cat, Dog, Edit3, PawPrint, Trash2, UserRound, ClipboardList } from 'lucide-react';
import api from '../../services/api';
import './Pets.scss';

const ESPECIES = ['Cão', 'Gato', 'Ave', 'Coelho', 'Roedor', 'Réptil', 'Outro'];

// Idade máxima (em anos) por espécie — precisa ser igual à do model no back-end
const IDADE_MAXIMA: Record<string, number> = {
  'Cão': 35, 'Gato': 40, 'Coelho': 20, 'Roedor': 15, 'Ave': 100, 'Réptil': 200, 'Outro': 200
};
const limiteIdade = (especie: string) => IDADE_MAXIMA[especie] ?? 200;

// Exemplos: "8 meses", "1 ano e 3 meses", "12 anos"
const formatarIdade = (anos?: number | string, meses?: number | string) => {
  const a = Number(anos) || 0;
  const m = Number(meses) || 0;
  const partes: string[] = [];
  if (a > 0) partes.push(`${a} ${a === 1 ? 'ano' : 'anos'}`);
  if (m > 0) partes.push(`${m} ${m === 1 ? 'mês' : 'meses'}`);
  return partes.join(' e ') || '--';
};

interface Tutor {
  _id: string;
  nome: string;
}

interface Pet {
  _id?: string;
  nome: string;
  especie: string;
  raca: string;
  idadeAnos: number | string;
  idadeMeses: number | string;
  tutorId: Tutor | string;
}

const FORM_VAZIO: Pet = { nome: '', especie: '', raca: '', idadeAnos: '', idadeMeses: '', tutorId: '' };

// Mesmas regras do back-end (model Pet)
const REGEX_NOME = /^(?=.*[A-Za-zÀ-ÿ])[A-Za-zÀ-ÿ0-9 .'\-]+$/;
const REGEX_RACA = /^(?=.*[A-Za-zÀ-ÿ])[A-Za-zÀ-ÿ '\-]+$/;

export default function Pets() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('@TCC:role') || 'tutor';
  const isVet = userRole === 'veterinario';

  const [pets, setPets] = useState<Pet[]>([]);
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Pet>(FORM_VAZIO);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregarDados = async () => {
    try {
      const resPets = await api.get('/pets');
      setPets(resPets.data);

      // Carrega lista de tutores apenas se não for veterinário (evita erro 403)
      if (!isVet) {
        const resTutores = await api.get('/tutores');
        setTutores(resTutores.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de Pets/Tutores:', error);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Retorna a mensagem de erro (ou '' se estiver tudo certo)
  const validarFormulario = (): string => {
    const nome = formData.nome.trim();
    const raca = formData.raca.trim();
    const anos = Number(formData.idadeAnos);
    const meses = Number(formData.idadeMeses);

    if (nome.length < 2) return 'O nome do pet deve ter pelo menos 2 caracteres.';
    if (!REGEX_NOME.test(nome)) return 'O nome do pet contém caracteres inválidos ou não pode ser só números.';
    if (!formData.especie) return 'Selecione a espécie do pet.';
    if (raca.length < 2) return 'A raça deve ter pelo menos 2 caracteres.';
    if (!REGEX_RACA.test(raca)) return 'A raça deve conter apenas letras.';

    if (!Number.isInteger(anos) || anos < 0) return 'Os anos devem ser um número inteiro maior ou igual a 0.';
    if (!Number.isInteger(meses) || meses < 0 || meses > 11) return 'Os meses devem ficar entre 0 e 11.';
    if (anos === 0 && meses === 0) return 'A idade não pode ser 0 anos e 0 meses. Informe ao menos 1 mês.';

    const limite = limiteIdade(formData.especie);
    if (anos > limite || (anos === limite && meses > 0)) {
      return `Idade acima do limite plausível para a espécie selecionada (máximo ${limite} anos).`;
    }

    return '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (salvando) return;

    const mensagem = validarFormulario();
    if (mensagem) {
      setErro(mensagem);
      return;
    }

    const payload = {
      nome: formData.nome.trim(),
      especie: formData.especie,
      raca: formData.raca.trim(),
      idadeAnos: Number(formData.idadeAnos),
      idadeMeses: Number(formData.idadeMeses),
      tutorId: typeof formData.tutorId === 'object' ? formData.tutorId._id : formData.tutorId
    };

    setErro('');
    setSalvando(true);
    try {
      if (editingId) await api.put(`/pets/${editingId}`, payload);
      else await api.post('/pets', payload);
      limparFormulario();
      carregarDados();
    } catch (error: any) {
      console.error('Erro ao salvar pet:', error);
      setErro(error.response?.data?.message || 'Erro ao salvar o pet. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const handleEdit = (pet: Pet) => {
    setErro('');
    setEditingId(pet._id || null);
    setFormData({
      nome: pet.nome,
      especie: pet.especie,
      raca: pet.raca,
      idadeAnos: pet.idadeAnos,
      idadeMeses: pet.idadeMeses,
      tutorId: typeof pet.tutorId === 'object' ? pet.tutorId._id : pet.tutorId
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este paciente (pet)?')) {
      try {
        await api.delete(`/pets/${id}`);
        carregarDados();
      } catch (error: any) {
        console.error('Erro ao deletar pet:', error);
        alert(error.response?.data?.message || 'Erro ao excluir o pet.');
      }
    }
  };

  const limparFormulario = () => {
    setEditingId(null);
    setErro('');
    setFormData(FORM_VAZIO);
  };

  const getPetIcon = (especie: string) => {
    const especieNormalizada = especie.toLowerCase();
    if (especieNormalizada.includes('gato') || especieNormalizada.includes('felino')) return <Cat size={18} />;
    if (especieNormalizada.includes('cão') || especieNormalizada.includes('cao') || especieNormalizada.includes('cachorro')) return <Dog size={18} />;
    return <PawPrint size={18} />;
  };

  return (
    <div className="pets-container">
      {/* BANNER DE CABEÇALHO */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1 className="page-title">{isVet ? 'Meus Pacientes' : 'Gestão de Pacientes'}</h1>
          <p className="hero-subtitle">
            {isVet
              ? 'Acompanhe a lista de animais sob seus cuidados clínicos e acesse rapidamente o histórico e prontuários.'
              : 'Cadastre novos animais, vincule aos seus tutores responsáveis e acompanhe os dados dos pacientes da clínica.'}
          </p>
        </div>
        <div className="hero-image-wrapper">
          <div className="hero-circle"></div>
          <div className="decor-cross cross-1">+</div>
          <div className="decor-cross cross-2">+</div>
          <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600" alt="Pet Paciente" className="pet-hero-img" />
        </div>
      </section>

      {/* SEÇÃO DE FORMULÁRIO (Exibido apenas para Admin e outros perfis que não sejam Veterinário) */}
      {!isVet && (
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
                  <input type="text" required maxLength={50} placeholder="Ex: Thor, Meg, Mel" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
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
                  <select required value={formData.especie} onChange={(e) => setFormData({ ...formData, especie: e.target.value })}>
                    <option value="">Selecione a espécie...</option>
                    {ESPECIES.map((especie) => <option key={especie} value={especie}>{especie}</option>)}
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label>Raça*</label>
                <div className="input-wrapper">
                  <Dog className="input-icon" size={17} />
                  <input type="text" required maxLength={50} placeholder="Ex: Poodle, SRD, Persa" value={formData.raca} onChange={(e) => setFormData({ ...formData, raca: e.target.value })} />
                </div>
              </div>
              <div className="input-group">
                <label>Idade — anos*</label>
                <div className="input-wrapper">
                  <CalendarDays className="input-icon" size={17} />
                  <input type="number" required min="0" max={limiteIdade(formData.especie)} step="1" placeholder="Ex: 3 (use 0 para filhotes)" value={formData.idadeAnos} onChange={(e) => setFormData({ ...formData, idadeAnos: e.target.value })} />
                </div>
              </div>
              <div className="input-group">
                <label>Idade — meses</label>
                <div className="input-wrapper">
                  <CalendarDays className="input-icon" size={17} />
                  <input type="number" min="0" max="11" step="1" placeholder="Ex: 6 (0 a 11)" value={formData.idadeMeses} onChange={(e) => setFormData({ ...formData, idadeMeses: e.target.value })} />
                </div>
              </div>
            </div>

            {erro && (
              <p role="alert" className="form-error" style={{ color: '#c62828', fontSize: '14px', margin: '12px 0 0' }}>
                {erro}
              </p>
            )}

            <div className="form-actions">
              {editingId && <button type="button" className="btn-secondary" onClick={limparFormulario}>Limpar</button>}
              <button type="submit" className="btn-primary" disabled={salvando}>
                {salvando ? 'Salvando...' : editingId ? 'Atualizar Paciente' : 'Salvar Paciente'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* TABELA DE PACIENTES */}
      <section className="table-section">
        <div className="table-card">
          <div className="table-header">
            <div>
              <h3>{isVet ? 'Pacientes' : 'Pacientes Cadastrados'}</h3>
              <p>{isVet ? 'Acesse o prontuário ou perfil de seus pacientes.' : 'Visualize, edite ou acesse o perfil dos pacientes cadastrados.'}</p>
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
                        <span>{formatarIdade(pet.idadeAnos, pet.idadeMeses)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="tutor-info">
                        <UserRound size={15} />
                        <span>{typeof pet.tutorId === 'object' && pet.tutorId !== null ? pet.tutorId.nome : 'Tutor não encontrado'}</span>
                      </div>
                    </td>
                    <td className="actions-cell">
                      {isVet ? (
                        <>
                          {/* Botões exclusivos do Veterinário */}
                          <button
                            className="btn-prontuario"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              backgroundColor: '#2e7d32',
                              color: '#fff',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 500,
                              fontSize: '13px'
                            }}
                            title="Ver Prontuário"
                            onClick={() => navigate(`/prontuarios?petId=${pet._id}`)}
                          >
                            <ClipboardList size={15} /> Prontuário
                          </button>
                          <button className="btn-ver-ficha" onClick={() => navigate(`/perfil-pet/${pet._id}`)}>
                            Ver Perfil
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Botões do Administrador / Geral */}
                          <button className="btn-edit" title="Editar" onClick={() => handleEdit(pet)}>
                            <Edit3 size={16} />
                          </button>
                          <button className="btn-delete" title="Excluir" onClick={() => handleDelete(pet._id!)}>
                            <Trash2 size={16} />
                          </button>
                          <button className="btn-ver-ficha" onClick={() => navigate(`/perfil-pet/${pet._id}`)}>
                            Ver Perfil
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {pets.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty-state">
                      {isVet ? 'Você ainda não possui pacientes vinculados a consultas.' : 'Nenhum paciente cadastrado até o momento.'}
                    </td>
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