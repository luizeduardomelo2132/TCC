// ConsultaController.js
import Consulta from '../models/Consulta.js';
import Pet from '../models/Pet.js';

export const criarConsulta = async (req, res) => {
  try {
    const {
      petId,
      veterinarioId,
      dataConsulta,
      motivo,
      tipo_de_atendimento,
      pesoAtual,
      status,
    } = req.body;

    // Se quem está solicitando é tutor, a consulta nasce como Pendente
    // e sem veterinário atribuído (a clínica atribui depois)
    const statusInicial =
      req.usuarioRole === 'tutor' ? 'Pendente' : status || 'Confirmada';

    const novaConsulta = new Consulta({
      petId,
      veterinarioId: req.usuarioRole === 'tutor' ? undefined : veterinarioId,
      dataConsulta,
      motivo,
      tipo_de_atendimento,
      pesoAtual,
      status: statusInicial,
    });

    const consultaSalva = await novaConsulta.save();
    res.status(201).json(consultaSalva);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const listarConsultas = async (req, res) => {
  try {
    const petIdQuery = req.query.pet || req.query.petId;

    let consultas = await Consulta.find()
      .populate('petId')
      .populate('veterinarioId', 'nome especialidade role');

    if (petIdQuery) {
      consultas = consultas.filter(
        (c) => c.petId?._id?.toString() === petIdQuery.toString()
      );
    }

    if (req.usuarioRole === 'veterinario') {
      consultas = consultas.filter(
        (c) => c.veterinarioId?._id?.toString() === req.usuarioId?.toString()
      );
    }

    if (req.usuarioRole === 'tutor') {
      const petsDoTutor = await Pet.find({ tutorId: req.usuarioId }).select('_id');
      const idsPetsDoTutor = petsDoTutor.map((p) => p._id.toString());

      consultas = consultas.filter((c) =>
        idsPetsDoTutor.includes(c.petId?._id?.toString())
      );
    }

    res.status(200).json(consultas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Retorna apenas as consultas do veterinário logado, agendadas para o dia atual.
// Usada pelo Dashboard do veterinário para evitar trazer o histórico inteiro.
export const minhaAgendaHoje = async (req, res) => {
  try {
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);

    const fimDia = new Date();
    fimDia.setHours(23, 59, 59, 999);

    const consultas = await Consulta.find({
      veterinarioId: req.usuarioId,
      dataConsulta: { $gte: inicioDia, $lte: fimDia },
    })
      .populate('petId')
      .populate('veterinarioId', 'nome especialidade role')
      .sort({ dataConsulta: 1 });

    res.status(200).json(consultas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const atualizarConsulta = async (req, res) => {
  try {
    const consultaAtualizada = await Consulta.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!consultaAtualizada) {
      return res.status(404).json({ message: 'Consulta não encontrada' });
    }

    res.status(200).json(consultaAtualizada);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deletarConsulta = async (req, res) => {
  try {
    const consultaDeletada = await Consulta.findByIdAndDelete(req.params.id);

    if (!consultaDeletada) {
      return res.status(404).json({ message: 'Consulta não encontrada' });
    }

    res.status(200).json({ message: 'Consulta removida com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};