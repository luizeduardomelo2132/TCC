import { useEffect, useState, type FormEvent } from 'react';
import api from '../../services/api';
import './Consultas.scss';
import { PawPrint } from 'lucide-react';

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
  especialidade?: string;
}

interface Consulta {
  _id?: string;
  dataConsulta: string;
  motivo: string;
  tipo_de_atendimento: string;
  pesoAtual?: number | string;
  petId: Pet | string;
  veterinarioId?: Usuario | string;
}

export default function Consultas() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [veterinarios, setVeterinarios] = useState<Usuario[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Consulta>({
    dataConsulta: '',
    motivo: '',
    tipo_de_atendimento: '',
    pesoAtual: '',
    petId: '',
    veterinarioId: '',
  });

  const carregarDados = async () => {
    try {
      const [resConsultas, resPets, resUsuarios] = await Promise.all([
        api.get('/consultas'),
        api.get('/pets'),
        api.get('/usuarios')
      ]);

      setConsultas(resConsultas.data);
      setPets(resPets.data);

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
      veterinarioId: typeof formData.veterinarioId === 'object' ? formData.veterinarioId._id : formData.veterinarioId,
      dataConsulta: new Date(formData.dataConsulta).toISOString(),
      motivo: formData.motivo,
      tipo_de_atendimento: formData.tipo_de_atendimento,
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
      tipo_de_atendimento: consulta.tipo_de_atendimento || '',
      pesoAtual: consulta.pesoAtual || '',
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
      } catch (error) {
        console.error('Erro ao deletar consulta:', error);
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
      petId: '',
      veterinarioId: ''
    });
  };

  return (
    <div className="consultas-container">
      <section className="hero-banner">
        <div className="hero-content">
          <h1 className="page-title">Agendamento de Consultas</h1>
          <p className="hero-subtitle">
            Marque consultas, atribua o veterinário especialista responsável e acompanhe a evolução de peso e saúde dos pacientes.
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

      {/* CARD DO FORMULÁRIO */}
      <section className="form-section">
        <div className="section-header">
          <h2>{editingId ? 'Editar Consulta' : 'Agendar Novo Atendimento'}</h2>
          <p>Selecione o paciente, o profissional responsável e informe os detalhes da consulta.</p>
        </div>

        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="input-group">
              <label>Paciente (Pet)*</label>
              <div className="input-wrapper">
                <PawPrint className="input-icon" size={17} />
                
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
            </div>

            <div className="input-group">
              <label>Veterinário Responsável*</label>
              <div className="input-wrapper">
                <span className="input-icon">🩺</span>
                <select
                  required
                  value={typeof formData.veterinarioId === 'object' ? formData.veterinarioId._id : formData.veterinarioId}
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

            {/* SELETOR: TIPO DE ATENDIMENTO */}
            <div className="input-group">
              <label>Tipo de Atendimento*</label>
              <div className="input-wrapper">
                <span className="input-icon">📋</span>
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
                <span className="input-icon">📅</span>
                <input
                  type="datetime-local"
                  required
                  value={formData.dataConsulta}
                  onChange={(e) => setFormData({ ...formData, dataConsulta: e.target.value })}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Peso Atual (kg)</label>
              <div className="input-wrapper">
                <span className="input-icon">⚖️</span>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 5.4"
                  value={formData.pesoAtual}
                  onChange={(e) => setFormData({ ...formData, pesoAtual: e.target.value })}
                />
              </div>
            </div>

            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label>Motivo da Consulta*</label>
              <div className="input-wrapper textarea-wrapper">
                <span className="input-icon">📝</span>
                <textarea
                  required
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
              {editingId ? 'Atualizar Consulta' : 'Agendar Consulta'}
            </button>
          </div>
        </form>
      </section>

      {/* TABELA DE CONSULTAS */}
      <section className="table-section">
        <div className="table-card">

          <div className="table-header">
            <div>
              <h3>Consultas Agendadas</h3>
              <p>Visualize, edite ou cancele as consultas cadastradas.</p>
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
                  <th>TIPO DE ATENDIMENTO</th>
                  <th>PESO (KG)</th>
                  <th>MOTIVO</th>
                  <th>AÇÕES</th>
                </tr>
              </thead>

              <tbody>

                {consultas.map((c) => {

                  const pet =
                    typeof c.petId === 'object' && c.petId !== null
                      ? c.petId
                      : null;

                  const veterinario =
                    typeof c.veterinarioId === 'object' &&
                      c.veterinarioId !== null
                      ? c.veterinarioId
                      : null;

                  const data = new Date(c.dataConsulta);

                  return (
                    <tr key={c._id}>

                      {/* DATA */}
                      <td className="date-cell">
                        <div className="date-content">
                          <span>
                            {data.toLocaleDateString('pt-BR')}
                          </span>

                          <small>
                            {data.toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </small>
                        </div>
                      </td>


                      {/* PET */}
                      <td>
                        <div className="pet-info">

                          <div className="pet-avatar">
                            {pet?.especie?.toLowerCase() === 'gato'
                              ? '🐱'
                              : '🐶'}
                          </div>

                          <div className="pet-details">
                            <strong>
                              {pet?.nome || 'Pet não encontrado'}
                            </strong>

                            <span>
                              {pet?.especie || 'Pet'}
                            </span>
                          </div>

                        </div>
                      </td>


                      {/* TUTOR */}
                      <td>
                        <span className="tutor-name">
                          {pet &&
                            'tutorId' in pet &&
                            typeof (pet as any).tutorId === 'object' &&
                            (pet as any).tutorId !== null
                            ? (pet as any).tutorId.nome
                            : '-'}
                        </span>
                      </td>


                      {/* VETERINÁRIO */}
                      <td>
                        <div className="vet-info">

                          <strong>
                            {veterinario
                              ? `Dr. ${veterinario.nome}`
                              : '-'}
                          </strong>

                          {veterinario?.especialidade && (
                            <span>
                              {veterinario.especialidade}
                            </span>
                          )}

                        </div>
                      </td>


                      {/* TIPO */}
                      <td>
                        <span className="type-badge">
                          {c.tipo_de_atendimento || 'Consulta'}
                        </span>
                      </td>


                      {/* PESO */}
                      <td>
                        <span className="peso-value">
                          {c.pesoAtual
                            ? `${c.pesoAtual}`
                            : '-'}
                        </span>
                      </td>


                      {/* MOTIVO */}
                      <td>
                        <span className="motivo-cell">
                          {c.motivo || '-'}
                        </span>
                      </td>


                      {/* AÇÕES */}
                      <td>
                        <div className="actions-cell">

                          <button
                            type="button"
                            className="btn-edit"
                            title="Editar consulta"
                            onClick={() => handleEdit(c)}
                          >
                            ✎
                          </button>

                          <button
                            type="button"
                            className="btn-delete"
                            title="Excluir consulta"
                            onClick={() => handleDelete(c._id!)}
                          >
                            🗑
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}


                {consultas.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="empty-state"
                    >
                      Nenhuma consulta registrada até o momento.
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