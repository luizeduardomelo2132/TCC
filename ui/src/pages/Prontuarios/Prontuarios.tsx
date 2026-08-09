import { useEffect, useState, type FormEvent } from 'react';
import api from '../../services/api';
import './Prontuarios.scss';

interface Pet {
  _id: string;
  nome: string;
  especie: string;
}

interface Consulta {
  _id: string;
  dataConsulta: string;
  motivo: string;
  petId: Pet;
}

interface Prontuario {
  _id?: string;
  consultaId: Consulta | string;
  diagnostico: string;
  prescricao?: string;
  examesSolicitados?: string;
  observacoes?: string;
}

export default function Prontuarios() {
  const [prontuarios, setProntuarios] = useState<Prontuario[]>([]);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Prontuario>({
    consultaId: '',
    diagnostico: '',
    prescricao: '',
    examesSolicitados: '',
    observacoes: '',
  });

  const carregarDados = async () => {
    try {
      const [resProntuarios, resConsultas] = await Promise.all([
        api.get('/prontuarios'),
        api.get('/consultas'),
      ]);
      setProntuarios(resProntuarios.data);
      setConsultas(resConsultas.data);
    } catch (error) {
      console.error('Erro ao carregar prontuários/consultas:', error);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const payload = {
      consultaId: typeof formData.consultaId === 'object' ? formData.consultaId._id : formData.consultaId,
      diagnostico: formData.diagnostico,
      prescricao: formData.prescricao,
      examesSolicitados: formData.examesSolicitados,
      observacoes: formData.observacoes,
    };

    try {
      if (editingId) {
        await api.put(`/prontuarios/${editingId}`, payload);
        alert('Prontuário atualizado com sucesso!');
      } else {
        await api.post('/prontuarios', payload);
        alert('Prontuário registrado com sucesso!');
      }
      limparFormulario();
      carregarDados();
    } catch (error: any) {
      console.error('Erro ao salvar prontuário:', error);
      const msg = error.response?.data?.message || 'Erro de conexão com o servidor.';
      alert(`Erro ao salvar: ${msg}`);
    }
  };

  const handleEdit = (prontuario: Prontuario) => {
    setEditingId(prontuario._id || null);
    setFormData({
      consultaId: typeof prontuario.consultaId === 'object' ? prontuario.consultaId._id : prontuario.consultaId,
      diagnostico: prontuario.diagnostico,
      prescricao: prontuario.prescricao || '',
      examesSolicitados: prontuario.examesSolicitados || '',
      observacoes: prontuario.observacoes || '',
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este prontuário?')) {
      try {
        await api.delete(`/prontuarios/${id}`);
        carregarDados();
      } catch (error) {
        console.error('Erro ao deletar prontuário:', error);
      }
    }
  };

  const limparFormulario = () => {
    setEditingId(null);
    setFormData({
      consultaId: '',
      diagnostico: '',
      prescricao: '',
      examesSolicitados: '',
      observacoes: '',
    });
  };

  return (
    <div className="prontuarios-container">
      <h1 className="page-title">Histórico Médico / Prontuários (RF04)</h1>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label>Selecione a Consulta*</label>
            <select
              required
              value={typeof formData.consultaId === 'object' ? formData.consultaId._id : formData.consultaId}
              onChange={(e) => setFormData({ ...formData, consultaId: e.target.value })}
            >
              <option value="">Selecione a consulta realizada...</option>
              {consultas.map((c) => (
                <option key={c._id} value={c._id}>
                  {new Date(c.dataConsulta).toLocaleString('pt-BR')} - {c.petId?.nome || 'Pet'} ({c.motivo})
                </option>
              ))}
            </select>
          </div>

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label>Diagnóstico*</label>
            <textarea
              required
              value={formData.diagnostico}
              onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>Prescrição / Medicamentos</label>
            <textarea
              value={formData.prescricao}
              onChange={(e) => setFormData({ ...formData, prescricao: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>Exames Solicitados</label>
            <textarea
              value={formData.examesSolicitados}
              onChange={(e) => setFormData({ ...formData, examesSolicitados: e.target.value })}
            />
          </div>

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label>Observações Gerais</label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
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
            {editingId ? 'Atualizar Prontuário' : 'Salvar Prontuário'}
          </button>
        </div>
      </form>

      <div className="table-card">
        <table className="prontuarios-table">
          <thead>
            <tr>
              <th>Data Consulta</th>
              <th>Pet</th>
              <th>Diagnóstico</th>
              <th>Prescrição</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {prontuarios.map((p) => {
              const consulta = typeof p.consultaId === 'object' ? p.consultaId : null;
              const pet = consulta?.petId;

              return (
                <tr key={p._id}>
                  <td>
                    {consulta?.dataConsulta
                      ? new Date(consulta.dataConsulta).toLocaleString('pt-BR')
                      : '-'}
                  </td>
                  <td>{pet?.nome ? `${pet.nome} (${pet.especie})` : '-'}</td>
                  <td>{p.diagnostico}</td>
                  <td>{p.prescricao || '-'}</td>
                  <td className="actions-cell">
                    <button className="btn-edit" onClick={() => handleEdit(p)}>Editar</button>
                    <button className="btn-delete" onClick={() => handleDelete(p._id!)}>Excluir</button>
                  </td>
                </tr>
              );
            })}
            {prontuarios.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center' }}>Nenhum prontuário registrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}