import { useEffect, useState, type FormEvent } from 'react';
import api from '../../services/api';
import './Consultas.scss';

interface Pet {
  _id: string;
  nome: string;
  especie: string;
}

// Interface para tipar os usuários (Veterinários)
interface Usuario {
  _id: string;
  nome: string;
  role: string;
}

interface Consulta {
  _id?: string;
  dataConsulta: string;
  motivo: string;
  pesoAtual?: number | string;
  petId: Pet | string;
  veterinarioId?: Usuario | string; // Adicionado para suportar string ou objeto populado
}

export default function Consultas() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [veterinarios, setVeterinarios] = useState<Usuario[]>([]); // Guarda os veterinários
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Consulta>({
    dataConsulta: '',
    motivo: '',
    pesoAtual: '',
    petId: '',
    veterinarioId: '', // Adicionado no formData
  });

  const carregarDados = async () => {
    try {
      // Busca Consultas, Pets e Usuários ao mesmo tempo
      const [resConsultas, resPets, resUsuarios] = await Promise.all([
        api.get('/consultas'),
        api.get('/pets'),
        api.get('/usuarios') // Rota que busca os usuários do sistema
      ]);
      
      setConsultas(resConsultas.data);
      setPets(resPets.data);

      // Filtra para guardar no estado apenas os usuários que são veterinários
      const apenasVets = resUsuarios.data.filter((u: Usuario) => u.role === 'veterinario');
      setVeterinarios(apenasVets);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const payload = {
      petId: typeof formData.petId === 'object' ? formData.petId._id : formData.petId,
      // Pega o ID do veterinário escolhido
      veterinarioId: typeof formData.veterinarioId === 'object' ? formData.veterinarioId._id : formData.veterinarioId,
      dataConsulta: new Date(formData.dataConsulta).toISOString(),
      motivo: formData.motivo,
      pesoAtual: formData.pesoAtual ? Number(formData.pesoAtual) : undefined,
    };

    try {
      if (editingId) {
        await api.put(`/consultas/${editingId}`, payload);
        alert('Consulta atualizada com sucesso!');
      } else {
        await api.post('/consultas', payload);
        alert('Consulta agendada com sucesso!');
      }
      limparFormulario();
      carregarDados();
    } catch (error: any) {
      console.error('Erro ao salvar consulta:', error);
      const msg = error.response?.data?.message || 'Erro de conexão com o servidor.';
      alert(`Erro ao salvar: ${msg}`);
    }
  };

  const handleEdit = (consulta: Consulta) => {
    setEditingId(consulta._id || null);

    const dataFormatada = consulta.dataConsulta
      ? new Date(consulta.dataConsulta).toISOString().slice(0, 16)
      : '';

    setFormData({
      dataConsulta: dataFormatada,
      motivo: consulta.motivo,
      pesoAtual: consulta.pesoAtual || '',
      petId: typeof consulta.petId === 'object' ? consulta.petId._id : consulta.petId,
      // Popula o campo do veterinário corretamente ao editar
      veterinarioId: typeof consulta.veterinarioId === 'object' && consulta.veterinarioId !== null 
        ? consulta.veterinarioId._id 
        : consulta.veterinarioId || '',
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta consulta?')) {
      try {
        await api.delete(`/consultas/${id}`);
        carregarDados();
      } catch (error) {
        console.error('Erro ao deletar consulta:', error);
      }
    }
  };

  const limparFormulario = () => {
    setEditingId(null);
    setFormData({ dataConsulta: '', motivo: '', pesoAtual: '', petId: '', veterinarioId: '' });
  };

  return (
    <div className="consultas-container">
      <h1 className="page-title">Agendamento de Consultas (RF03)</h1>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="input-group">
            <label>Paciente (Pet)*</label>
            <select
              required
              value={typeof formData.petId === 'object' ? formData.petId._id : formData.petId}
              onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
            >
              <option value="">Selecione um Pet...</option>
              {pets.map((pet) => (
                <option key={pet._id} value={pet._id}>
                  {pet.nome} ({pet.especie})
                </option>
              ))}
            </select>
          </div>

          {/* NOVO CAMPO: Seleção do Veterinário */}
          <div className="input-group">
            <label>Veterinário Responsável*</label>
            <select
              required
              value={typeof formData.veterinarioId === 'object' ? formData.veterinarioId._id : formData.veterinarioId}
              onChange={(e) => setFormData({ ...formData, veterinarioId: e.target.value })}
            >
              <option value="">Selecione um Veterinário...</option>
              {veterinarios.map((vet) => (
                <option key={vet._id} value={vet._id}>
                  Dr(a). {vet.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Data e Hora da Consulta*</label>
            <input
              type="datetime-local"
              required
              value={formData.dataConsulta}
              onChange={(e) => setFormData({ ...formData, dataConsulta: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>Peso Atual (kg)</label>
            <input
              type="number"
              step="0.1"
              placeholder="Ex: 5.4"
              value={formData.pesoAtual}
              onChange={(e) => setFormData({ ...formData, pesoAtual: e.target.value })}
            />
          </div>

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label>Motivo da Consulta*</label>
            <textarea
              required
              placeholder="Ex: Vacinação de rotina, exames gerais..."
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
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
            {editingId ? 'Atualizar Consulta' : 'Agendar Consulta'}
          </button>
        </div>
      </form>

      <div className="table-card">
        <table className="consultas-table">
          <thead>
            <tr>
              <th>Data / Hora</th>
              <th>Pet</th>
              <th>Veterinário</th> {/* NOVA COLUNA */}
              <th>Peso (kg)</th>
              <th>Motivo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {consultas.map((c) => (
              <tr key={c._id}>
                <td>{new Date(c.dataConsulta).toLocaleString('pt-BR')}</td>
                <td>
                  {typeof c.petId === 'object' && c.petId !== null
                    ? c.petId.nome
                    : 'Pet não encontrado'}
                </td>
                {/* MOSTRANDO O NOME DO VETERINÁRIO NA TABELA */}
                <td>
                  {typeof c.veterinarioId === 'object' && c.veterinarioId !== null
                    ? `Dr(a). ${c.veterinarioId.nome}`
                    : '-'}
                </td>
                <td>{c.pesoAtual ? `${c.pesoAtual} kg` : '-'}</td>
                <td>{c.motivo}</td>
                <td className="actions-cell">
                  <button className="btn-edit" onClick={() => handleEdit(c)}>Editar</button>
                  <button className="btn-delete" onClick={() => handleDelete(c._id!)}>Excluir</button>
                </td>
              </tr>
            ))}
            {consultas.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>Nenhuma consulta registrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}