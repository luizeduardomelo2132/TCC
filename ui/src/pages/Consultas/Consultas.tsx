import { useEffect, useState, type FormEvent } from 'react';
import api from '../../services/api';
import './Consultas.scss';

interface Pet {
  _id: string;
  nome: string;
  especie: string;
}

interface Consulta {
  _id?: string;
  dataConsulta: string;
  motivo: string;
  pesoAtual?: number | string;
  petId: Pet | string;
}

export default function Consultas() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Consulta>({
    dataConsulta: '',
    motivo: '',
    pesoAtual: '',
    petId: '',
  });

  const carregarDados = async () => {
    try {
      const [resConsultas, resPets] = await Promise.all([
        api.get('/consultas'),
        api.get('/pets'),
      ]);
      setConsultas(resConsultas.data);
      setPets(resPets.data);
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
    setFormData({ dataConsulta: '', motivo: '', pesoAtual: '', petId: '' });
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
                <td colSpan={5} style={{ textAlign: 'center' }}>Nenhuma consulta registrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}