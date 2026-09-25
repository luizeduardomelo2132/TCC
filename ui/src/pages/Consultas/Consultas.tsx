import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Consultas.scss';
import {
  PawPrint,
  Stethoscope,
  ClipboardList,
  CalendarClock,
  Scale,
  FileText,
  Cat,
  Dog,
  Pencil,
  Trash2,
  CheckCircle2
} from 'lucide-react';

interface Pet {
  _id: string;
  nome: string;
  especie: string;
}

interface Usuario {
  _id: string;
  nome: string;
  role: string;
  especialidade?: string;
}

interface Consulta {
  _id?: string;
  dataConsulta: string;
  motivo: string;
  tipo_de_atendimento: string;
  pesoAtual?: number | string;
  status?: string;
  petId: Pet | string;
  veterinarioId?: Usuario | string | null;
}

export default function Consultas() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('@TCC:role') || 'tutor';
  const isVet = userRole === 'veterinario';

  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [veterinarios, setVeterinarios] = useState<Usuario[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Consulta>({
    dataConsulta: '',
    motivo: '',
    tipo_de_atendimento: '',
    pesoAtual: '',
    status: 'Pendente',
    petId: '',
    veterinarioId: '',
  });

  const carregarDados = async () => {
    try {
      const resConsultas = await api.get('/consultas');
      setConsultas(resConsultas.data);

      // Carrega dados de formulário apenas se não for veterinário
      if (!isVet) {
        const [resPets, resUsuarios] = await Promise.all([
          api.get('/pets'),
          api.get('/usuarios/veterinarios')
        ]);

        setPets(resPets.data);
        setVeterinarios(resUsuarios.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de consultas:', error);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const payload = {
      petId: typeof formData.petId === 'object' ? formData.petId._id : formData.petId,
      veterinarioId: typeof formData.veterinarioId === 'object' && formData.veterinarioId ? formData.veterinarioId._id : (formData.veterinarioId || undefined),
      dataConsulta: new Date(formData.dataConsulta).toISOString(),
      motivo: formData.motivo,
      tipo_de_atendimento: formData.tipo_de_atendimento,
      pesoAtual: formData.pesoAtual ? Number(formData.pesoAtual) : undefined,
      status: formData.status || 'Confirmada',
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
      tipo_de_atendimento: consulta.tipo_de_atendimento || '',
      pesoAtual: consulta.pesoAtual || '',
      status: consulta.status || 'Pendente',
      petId: typeof consulta.petId === 'object' ? consulta.petId._id : consulta.petId,
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
      } catch (error: any) {
        console.error('Erro ao deletar consulta:', error);
        const msg = error.response?.data?.message || 'Erro ao excluir consulta.';
        alert(msg);
      }
    }
  };

  const limparFormulario = () => {
    setEditingId(null);
    setFormData({
      dataConsulta: '',
      motivo: '',
      tipo_de_atendimento: '',
      pesoAtual: '',
      status: 'Pendente',
      petId: '',
      veterinarioId: ''
    });
  };

  return (
    <div className="consultas-container">
      {/* BANNER DE CABEÇALHO */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1 className="page-title">{isVet ? 'Minha Agenda de Consultas' : 'Agendamento de Consultas'}</h1>
          <p className="hero-subtitle">
            {isVet
              ? 'Acompanhe seus atendimentos agendados, consulte o histórico dos pacientes e acesse seus prontuários.'
              : 'Gerencie as solicitações enviadas pelos tutores, atribua veterinários e altere o status dos atendimentos.'}
          </p>
        </div>

        <div className="hero-image-wrapper">
          <div className="decor-shape"></div>
          <div className="decor-cross cross-1">+</div>
          <div className="decor-cross cross-2">+</div>
          <img
            src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&q=80&w=600"
            alt="Atendimento Veterinário"
            className="pet-hero-img"
          />
        </div>
      </section>

      {/* CARD DO FORMULÁRIO (Exibido apenas se NÃO for veterinário) */}
      {!isVet && (
        <section className="form-section">
          <div className="section-header">
            <h2>{editingId ? 'Editar / Aprovar Consulta' : 'Agendar Novo Atendimento'}</h2>
            <p>Selecione o paciente, atribua o profissional e altere o status conforme necessário.</p>
          </div>

          <form className="form-card" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="input-group">
                <label>Paciente (Pet)*</label>
                <div className="input-wrapper">
                  <PawPrint className="input-icon" size={17} />
                  <select
                    required
                    disabled={!!editingId}
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
                {editingId && (
                  <small style={{ color: '#73776f', fontSize: '12px' }}>
                    O paciente vinculado não pode ser alterado após o agendamento.
                  </small>
                )}
              </div>

              <div className="input-group">
                <label>Veterinário Responsável*</label>
                <div className="input-wrapper">
                  <Stethoscope className="input-icon" size={17} />
                  <select
                    required
                    value={typeof formData.veterinarioId === 'object' && formData.veterinarioId !== null ? formData.veterinarioId._id : formData.veterinarioId || ''}
                    onChange={(e) => setFormData({ ...formData, veterinarioId: e.target.value })}
                  >
                    <option value="">Selecione um Veterinário...</option>
                    {veterinarios.map((vet) => (
                      <option key={vet._id} value={vet._id}>
                        Dr(a). {vet.nome} {vet.especialidade ? `(${vet.especialidade})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Tipo de Atendimento*</label>
                <div className="input-wrapper">
                  <ClipboardList className="input-icon" size={17} />
                  <select
                    required
                    value={formData.tipo_de_atendimento}
                    onChange={(e) => setFormData({ ...formData, tipo_de_atendimento: e.target.value })}
                  >
                    <option value="">Selecione o tipo de atendimento...</option>
                    <option value="Consulta Normal">Consulta Normal / Rotina</option>
                    <option value="Exames de Imagem">Exames de Imagem (Raio-X, Ultrassom)</option>
                    <option value="Exames Laboratoriais">Exames Laboratoriais (Sangue, Urina, etc.)</option>
                    <option value="Vacinação">Vacinação / Imunização</option>
                    <option value="Procedimento Cirúrgico">Procedimento Cirúrgico</option>
                    <option value="Retorno">Retorno</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Data e Hora da Consulta*</label>
                <div className="input-wrapper">
                  <CalendarClock className="input-icon" size={17} />
                  <input
                    type="datetime-local"
                    required
                    value={formData.dataConsulta}
                    onChange={(e) => setFormData({ ...formData, dataConsulta: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Status da Consulta*</label>
                <div className="input-wrapper">
                  <CheckCircle2 className="input-icon" size={17} />
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Pendente">Pendente (Aguardando Aprovação)</option>
                    <option value="Confirmada">Confirmada</option>
                    <option value="Concluída">Concluída</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Peso Atual (kg)</label>
                <div className="input-wrapper">
                  <Scale className="input-icon" size={17} />
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Ex: 5.4"
                    value={formData.pesoAtual}
                    onChange={(e) => setFormData({ ...formData, pesoAtual: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Motivo da Consulta*</label>
                <div className="input-wrapper textarea-wrapper">
                  <FileText className="input-icon" size={17} />
                  <textarea
                    required
                    minLength={5}
                    placeholder="Ex: Vacinação de rotina, exames gerais, sintomas oculares..."
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
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
                {editingId ? 'Atualizar / Confirmar Consulta' : 'Agendar Consulta'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* TABELA DE CONSULTAS */}
      <section className="table-section">
        <div className="table-card">
          <div className="table-header">
            <div>
              <h3>{isVet ? 'Minha Fila de Atendimento' : 'Consultas e Solicitações'}</h3>
              <p>{isVet ? 'Visualize os horários marcados para você e acesse a ficha do paciente.' : 'Gerencie as solicitações enviadas e altere atribuições de veterinários.'}</p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="consultas-table">
              <thead>
                <tr>
                  <th>DATA E HORA</th>
                  <th>PET</th>
                  <th>TUTOR</th>
                  <th>VETERINÁRIO</th>
                  <th>TIPO</th>
                  <th>STATUS</th>
                  <th>MOTIVO</th>
                  <th>AÇÕES</th>
                </tr>
              </thead>

              <tbody>
                {consultas.map((c) => {
                  const pet = typeof c.petId === 'object' && c.petId !== null ? c.petId : null;
                  const veterinario = typeof c.veterinarioId === 'object' && c.veterinarioId !== null ? c.veterinarioId : null;
                  const data = new Date(c.dataConsulta);
                  const isGato = pet?.especie?.toLowerCase() === 'gato';
                  const status = c.status || 'Pendente';

                  return (
                    <tr key={c._id}>
                      <td className="date-cell">
                        <div className="date-content">
                          <span>{data.toLocaleDateString('pt-BR')}</span>
                          <small>{data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small>
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
                        <span className="tutor-name">
                          {pet && 'tutorId' in pet && typeof (pet as any).tutorId === 'object' && (pet as any).tutorId !== null
                            ? (pet as any).tutorId.nome
                            : '-'}
                        </span>
                      </td>

                      <td>
                        <div className="vet-info">
                          {veterinario ? (
                            <>
                              <strong>Dr(a). {veterinario.nome}</strong>
                              {veterinario.especialidade && <span>{veterinario.especialidade}</span>}
                            </>
                          ) : (
                            <span style={{ color: '#d97706', fontWeight: 600 }}>Pendente Atribuição</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className="type-badge">{c.tipo_de_atendimento || 'Consulta'}</span>
                      </td>

                      <td>
                        <span className={`status-badge ${status.toLowerCase().replace('í', 'i').replace(/\s/g, '-')}`}>
                          {status}
                        </span>
                      </td>

                      <td>
                        <span className="motivo-cell">{c.motivo || '-'}</span>
                      </td>

                      <td>
                        <div className="actions-cell">
                          {isVet ? (
                            /* Botões de Ação para Veterinário */
                            <button
                              type="button"
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
                                fontSize: '13px',
                                whiteSpace: 'nowrap'
                              }}
                              title="Ver Prontuário"
                              onClick={() => {
                                if (pet?._id) navigate(`/prontuarios?petId=${pet._id}`);
                              }}
                            >
                              <ClipboardList size={15} /> Prontuário
                            </button>
                          ) : (
                            /* Botões de Ação para Admin/Recepção */
                            <>
                              <button
                                type="button"
                                className="btn-edit"
                                title="Editar / Aprovar Consulta"
                                onClick={() => handleEdit(c)}
                              >
                                <Pencil size={15} />
                              </button>

                              <button
                                type="button"
                                className="btn-delete"
                                title="Excluir consulta"
                                onClick={() => handleDelete(c._id!)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {consultas.length === 0 && (
                  <tr>
                    <td colSpan={8} className="empty-state">
                      {isVet ? 'Nenhuma consulta agendada para você no momento.' : 'Nenhuma consulta cadastrada no momento.'}
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