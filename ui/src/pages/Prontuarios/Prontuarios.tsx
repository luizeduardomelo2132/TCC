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
      {/* SEÇÃO HERO BANNER */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1 className="page-title">Histórico Médico & Prontuários</h1>
          <p className="hero-subtitle">
            Registre diagnósticos, prescreva medicações, solicite exames e acompanhe todo o histórico de saúde do seu paciente.
          </p>
        </div>

        <div className="hero-image-wrapper">
          <div className="decor-shape"></div>
          <div className="decor-cross cross-1">+</div>
          <div className="decor-cross cross-2">+</div>
          <img
            src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=600"
            alt="Exame Veterinário"
            className="pet-hero-img"
          />
        </div>
      </section>

      {/* CARD DO FORMULÁRIO */}
      <section className="form-section">
        <div className="section-header">
          <h2>{editingId ? 'Editar Prontuário' : 'Novo Prontuário Médico'}</h2>
          <p>Preencha os dados clínicos da consulta selecionada.</p>
        </div>

        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="input-group full-width">
              <label>Selecione a Consulta*</label>
              <div className="input-wrapper">
                <span className="input-icon">📋</span>
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
            </div>

            <div className="input-group full-width">
              <label>Diagnóstico*</label>
              <div className="input-wrapper textarea-wrapper">
                <span className="input-icon">🩺</span>
                <textarea
                  required
                  placeholder="Descreva detalhadamente o diagnóstico do paciente..."
                  value={formData.diagnostico}
                  onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Prescrição / Medicamentos</label>
              <div className="input-wrapper textarea-wrapper">
                <span className="input-icon">💊</span>
                <textarea
                  placeholder="Instruções de medicação, dosagens e horários..."
                  value={formData.prescricao}
                  onChange={(e) => setFormData({ ...formData, prescricao: e.target.value })}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Exames Solicitados</label>
              <div className="input-wrapper textarea-wrapper">
                <span className="input-icon">🔬</span>
                <textarea
                  placeholder="Exames de sangue, radiografias, ultrassom..."
                  value={formData.examesSolicitados}
                  onChange={(e) => setFormData({ ...formData, examesSolicitados: e.target.value })}
                />
              </div>
            </div>

            <div className="input-group full-width">
              <label>Observações Gerais</label>
              <div className="input-wrapper textarea-wrapper">
                <span className="input-icon">📝</span>
                <textarea
                  placeholder="Anotações adicionais sobre o comportamento ou retorno do paciente..."
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                />
              </div>
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
      </section>

      {/* TABELA DE PRONTUÁRIOS */}
      <section className="table-section">
        <div className="table-card">
          <div className="table-header">
            <h3>Prontuários Registrados ({prontuarios.length})</h3>
          </div>

          <table className="prontuarios-table">
            <thead>
              <tr>
                <th>Data Consulta</th>
                <th>Pet / Paciente</th>
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
                    <td className="date-cell">
                      <span className="date-badge">
                        {consulta?.dataConsulta
                          ? new Date(consulta.dataConsulta).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </span>
                    </td>
                    <td>
                      <span className="pet-tag">
                        🐶 {pet?.nome ? `${pet.nome} (${pet.especie})` : '-'}
                      </span>
                    </td>
                    <td className="text-preview">{p.diagnostico}</td>
                    <td className="text-preview">{p.prescricao || '-'}</td>
                    <td className="actions-cell">
                      <button className="btn-edit" onClick={() => handleEdit(p)}>
                        Editar
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(p._id!)}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                );
              })}
              {prontuarios.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-state">
                    Nenhum prontuário registrado até o momento.
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