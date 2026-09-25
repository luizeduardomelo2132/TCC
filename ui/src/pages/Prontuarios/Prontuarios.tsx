import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Prontuarios.scss';
import {
  ClipboardList,
  Stethoscope,
  Pill,
  FlaskConical,
  MessageSquare,
  Cat,
  Dog,
  Pencil,
  Trash2,
  Eye
} from 'lucide-react';

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
  consultaId: Consulta | string | null;
  diagnostico: string;
  prescricao?: string;
  examesSolicitados?: string;
  observacoes?: string;
}

// Mesma regra do back-end: o campo não pode conter só números
const REGEX_TEM_LETRA = /[a-zA-ZÀ-ÿ]/;

export default function Prontuarios() {
  const navigate = useNavigate();

  const [prontuarios, setProntuarios] = useState<Prontuario[]>([]);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [erro, setErro] = useState('');

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
        api.get('/consultas')
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

  // Retorna a mensagem de erro (ou '' se estiver tudo certo)
  const validarFormulario = (): string => {
    const diagnostico = formData.diagnostico.trim();
    const prescricao = (formData.prescricao || '').trim();
    const exames = (formData.examesSolicitados || '').trim();
    const observacoes = (formData.observacoes || '').trim();

    if (diagnostico.length < 10) return 'O diagnóstico deve ter no mínimo 10 caracteres.';
    if (!REGEX_TEM_LETRA.test(diagnostico)) return 'O diagnóstico não pode conter apenas números.';

    if (prescricao && !REGEX_TEM_LETRA.test(prescricao)) return 'A prescrição não pode conter apenas números.';
    if (exames && !REGEX_TEM_LETRA.test(exames)) return 'Os exames solicitados não podem conter apenas números.';
    if (observacoes && !REGEX_TEM_LETRA.test(observacoes)) return 'As observações não podem conter apenas números.';

    return '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const mensagem = validarFormulario();
    if (mensagem) {
      setErro(mensagem);
      return;
    }

    const payload = {
      consultaId:
        formData.consultaId && typeof formData.consultaId === 'object'
          ? formData.consultaId._id
          : formData.consultaId,
      diagnostico: formData.diagnostico,
      prescricao: formData.prescricao,
      examesSolicitados: formData.examesSolicitados,
      observacoes: formData.observacoes,
    };

    setErro('');

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
    setErro('');
    setEditingId(prontuario._id || null);

    setFormData({
      consultaId:
        prontuario.consultaId && typeof prontuario.consultaId === 'object'
          ? prontuario.consultaId._id
          : prontuario.consultaId,
      diagnostico: prontuario.diagnostico,
      prescricao: prontuario.prescricao || '',
      examesSolicitados: prontuario.examesSolicitados || '',
      observacoes: prontuario.observacoes || '',
    });

    window.scrollTo({ top: 300, behavior: 'smooth' });
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
    setErro('');
    setFormData({
      consultaId: '',
      diagnostico: '',
      prescricao: '',
      examesSolicitados: '',
      observacoes: '',
    });
  };

  // Consultas que já têm prontuário (exceto a que está sendo editada agora)
  // não aparecem como opção — impede tentar criar um duplicado pela tela
  const consultasComProntuario = new Set(
    prontuarios
      .filter((p) => p._id !== editingId)
      .map((p) =>
        p.consultaId && typeof p.consultaId === 'object' ? p.consultaId._id : p.consultaId
      )
  );

  return (
    <div className="prontuarios-container">
      {/* BANNER DE CABEÇALHO */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1 className="page-title">Histórico Médico & Prontuários</h1>
          <p className="hero-subtitle">
            Registre diagnósticos, prescreva medicações, solicite exames e acompanhe todo o histórico de saúde dos seus pacientes.
          </p>
        </div>

        <div className="hero-image-wrapper">
          <div className="decor-shape"></div>
          <div className="decor-cross cross-1">+</div>
          <div className="decor-cross cross-2">+</div>
          <img
            src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=600"
            alt="Exame veterinário"
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
            <div className="input-group">
              <label>Consulta*</label>
              <div className="input-wrapper">
                <ClipboardList className="input-icon" size={17} />
                <select
                  required
                  disabled={!!editingId}
                  value={typeof formData.consultaId === 'object' ? formData.consultaId?._id || '' : formData.consultaId || ''}
                  onChange={(e) => setFormData({ ...formData, consultaId: e.target.value })}
                >
                  <option value="">Selecione uma consulta...</option>
                  {consultas
                    .filter((consulta) => !consultasComProntuario.has(consulta._id))
                    .map((consulta) => (
                      <option key={consulta._id} value={consulta._id}>
                        {new Date(consulta.dataConsulta).toLocaleString('pt-BR')} - {consulta.petId?.nome || 'Pet'} ({consulta.motivo})
                      </option>
                    ))}
                </select>
              </div>
              {editingId && (
                <small style={{ color: '#73776f', fontSize: '12px' }}>
                  A consulta vinculada não pode ser alterada após o registro.
                </small>
              )}
            </div>

            <div className="input-group">
              <label>Diagnóstico*</label>
              <div className="input-wrapper textarea-wrapper">
                <Stethoscope className="input-icon" size={17} />
                <textarea
                  required
                  minLength={10}
                  placeholder="Descreva o diagnóstico do paciente..."
                  value={formData.diagnostico}
                  onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Prescrição / Medicamentos</label>
              <div className="input-wrapper textarea-wrapper">
                <Pill className="input-icon" size={17} />
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
                <FlaskConical className="input-icon" size={17} />
                <textarea
                  placeholder="Exames de sangue, radiografias, ultrassom..."
                  value={formData.examesSolicitados}
                  onChange={(e) => setFormData({ ...formData, examesSolicitados: e.target.value })}
                />
              </div>
            </div>

            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label>Observações Gerais</label>
              <div className="input-wrapper textarea-wrapper">
                <MessageSquare className="input-icon" size={17} />
                <textarea
                  placeholder="Anotações adicionais sobre o paciente..."
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                />
              </div>
            </div>
          </div>

          {erro && (
            <p role="alert" className="form-error" style={{ color: '#c62828', fontSize: '14px', margin: '12px 0 0' }}>
              {erro}
            </p>
          )}

          <div className="form-actions">
            {editingId && (
              <button type="button" className="btn-secondary" onClick={limparFormulario}>
                Cancelar Edição
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
            <div>
              <h3>Prontuários Registrados</h3>
              <p>Visualize, edite ou consulte o histórico médico dos pacientes.</p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="prontuarios-table">
              <thead>
                <tr>
                  <th>DATA CONSULTA</th>
                  <th>PET</th>
                  <th>DIAGNÓSTICO</th>
                  <th>PRESCRIÇÃO</th>
                  <th>AÇÕES</th>
                </tr>
              </thead>

              <tbody>
                {prontuarios.map((prontuario) => {
                  const consulta =
                    prontuario.consultaId && typeof prontuario.consultaId === 'object'
                      ? prontuario.consultaId
                      : null;
                  const pet = consulta?.petId;
                  const data = consulta?.dataConsulta ? new Date(consulta.dataConsulta) : null;
                  const isGato = pet?.especie?.toLowerCase() === 'gato';

                  return (
                    <tr key={prontuario._id}>
                      <td className="date-cell">
                        <div className="date-content">
                          <span>{data ? data.toLocaleDateString('pt-BR') : '-'}</span>
                          <small>{data ? data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}</small>
                        </div>
                      </td>

                      <td>
                        <div className="pet-info">
                          <div className="pet-avatar">{isGato ? <Cat /> : <Dog />}</div>
                          <div className="pet-details">
                            <strong>{pet?.nome || 'Pet não encontrado'}</strong>
                            <span>{pet?.especie || 'Pet'}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="motivo-cell">{prontuario.diagnostico || '-'}</span>
                      </td>

                      <td>
                        <span className="motivo-cell">{prontuario.prescricao || '-'}</span>
                      </td>

                      <td>
                        <div className="actions-cell">
                          <button
                            type="button"
                            className="btn-edit"
                            title="Editar Prontuário"
                            onClick={() => handleEdit(prontuario)}
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            className="btn-delete"
                            title="Excluir prontuário"
                            onClick={() => handleDelete(prontuario._id!)}
                          >
                            <Trash2 size={15} />
                          </button>

                          <button
                            type="button"
                            className="btn-ver-perfil"
                            title="Ver perfil do paciente"
                            onClick={() => (pet?._id ? navigate(`/perfil-pet/${pet._id}`) : alert('Paciente não encontrado neste prontuário.'))}
                          >
                            <Eye size={15} /> Ver Perfil
                          </button>
                        </div>
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
        </div>
      </section>
    </div>
  );
}
