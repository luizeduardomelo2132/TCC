import { useEffect, useState, type FormEvent } from 'react';
import api from '../../services/api';
import './Tutores.scss';

interface Tutor {
  _id?: string;
  nome: string;
  email: string;
  telefone: string;
  endereco?: string;
}

export default function Tutores() {
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Tutor>({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
  });

  const carregarTutores = () => {
    api.get('/tutores')
      .then((res) => setTutores(res.data))
      .catch((err) => console.error('Erro ao buscar tutores:', err));
  };

  useEffect(() => {
    carregarTutores();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(`/tutores/${editingId}`, formData);
      } else {
        await api.post('/tutores', formData);
      }

      limparFormulario();
      carregarTutores();
    } catch (error) {
      console.error('Erro ao salvar tutor:', error);
    }
  };

  const handleEdit = (tutor: Tutor) => {
    setEditingId(tutor._id || null);

    setFormData({
      nome: tutor.nome,
      email: tutor.email,
      telefone: tutor.telefone,
      endereco: tutor.endereco || '',
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este tutor?')) {
      try {
        await api.delete(`/tutores/${id}`);

        carregarTutores();
      } catch (error) {
        console.error('Erro ao deletar tutor:', error);
      }
    }
  };

  const limparFormulario = () => {
    setEditingId(null);

    setFormData({
      nome: '',
      email: '',
      telefone: '',
      endereco: '',
    });
  };

  return (
    <div className="tutores-container">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="hero-banner">

        <div className="hero-content">

          <h1 className="page-title">
            Gestão de Tutores
          </h1>

          <p className="hero-subtitle">
            Cadastre e gerencie os dados dos responsáveis pelos
            pets cadastrados na clínica de forma prática e segura.
          </p>

        </div>


        <div className="hero-image-wrapper">

          <div className="decor-shape"></div>

          <div className="decor-cross cross-1">
            +
          </div>

          <div className="decor-cross cross-2">
            +
          </div>

          <img
            src="https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=600"
            alt="Tutor com Pet"
            className="pet-hero-img"
          />

        </div>

      </section>


      {/* =====================================================
          NOVO TUTOR
      ===================================================== */}

      <section className="form-section">

        <div className="section-header">

          <h2>
            {editingId
              ? 'Editar Tutor'
              : 'Cadastrar Novo Tutor'}
          </h2>

          <p>
            Informe os dados do responsável para contato e
            cadastro na clínica.
          </p>

        </div>


        <form
          className="form-card"
          onSubmit={handleSubmit}
        >

          <div className="form-grid">

            {/* NOME */}

            <div className="input-group">

              <label>
                Nome Completo*
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  👤
                </span>

                <input
                  type="text"
                  required
                  placeholder="Ex: Maria Silva"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nome: e.target.value,
                    })
                  }
                />

              </div>

            </div>


            {/* EMAIL */}

            <div className="input-group">

              <label>
                E-mail*
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  ✉
                </span>

                <input
                  type="email"
                  required
                  placeholder="Ex: maria@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                />

              </div>

            </div>


            {/* TELEFONE */}

            <div className="input-group">

              <label>
                Telefone*
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  ☎
                </span>

                <input
                  type="text"
                  required
                  placeholder="Ex: (11) 98765-4321"
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      telefone: e.target.value,
                    })
                  }
                />

              </div>

            </div>


            {/* ENDEREÇO */}

            <div className="input-group">

              <label>
                Endereço
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  ⌂
                </span>

                <input
                  type="text"
                  placeholder="Ex: Rua das Flores, 123"
                  value={formData.endereco}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      endereco: e.target.value,
                    })
                  }
                />

              </div>

            </div>

          </div>


          {/* BOTÕES */}

          <div className="form-actions">

            {editingId && (
              <button
                type="button"
                className="btn-secondary"
                onClick={limparFormulario}
              >
                Cancelar
              </button>
            )}

            <button
              type="submit"
              className="btn-primary"
            >
              {editingId
                ? 'Atualizar Tutor'
                : 'Salvar Tutor'}
            </button>

          </div>

        </form>

      </section>


      {/* =====================================================
          TUTORES CADASTRADOS
      ===================================================== */}

      <section className="table-section">

        <div className="table-card">

          <div className="table-header">

            <h3>
              Tutores Cadastrados
            </h3>

            <p>
              Visualize, edite ou exclua os tutores cadastrados.
            </p>

          </div>


          <table className="tutores-table">

            <thead>

              <tr>

                <th>
                  TUTOR
                </th>

                <th>
                  E-MAIL
                </th>

                <th>
                  TELEFONE
                </th>

                <th>
                  ENDEREÇO
                </th>

                <th>
                  AÇÕES
                </th>

              </tr>

            </thead>


            <tbody>

              {tutores.map((tutor) => (

                <tr key={tutor._id}>

                  <td className="tutor-nome-cell">

                    <span className="tutor-avatar">
                      👤
                    </span>

                    <strong className="tutor-nome">
                      {tutor.nome}
                    </strong>

                  </td>


                  <td>

                    <div className="contact-info">

                      <span className="email">
                        {tutor.email}
                      </span>

                    </div>

                  </td>


                  <td>

                    <div className="contact-info">

                      <span className="phone">
                        {tutor.telefone}
                      </span>

                    </div>

                  </td>


                  <td>

                    {tutor.endereco || '-'}

                  </td>


                  <td className="actions-cell">

                    <button
                      className="btn-edit"
                      title="Editar tutor"
                      onClick={() => handleEdit(tutor)}
                    >
                      Editar
                    </button>

                    <button
                      className="btn-delete"
                      title="Excluir tutor"
                      onClick={() =>
                        handleDelete(tutor._id!)
                      }
                    >
                      Excluir
                    </button>

                  </td>

                </tr>

              ))}


              {tutores.length === 0 && (

                <tr>

                  <td
                    colSpan={5}
                    className="empty-state"
                  >
                    Nenhum tutor cadastrado até o momento.
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