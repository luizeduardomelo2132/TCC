import Consulta from '../models/Consulta.js';
import Pet from '../models/Pet.js';
import Prontuario from '../models/Prontuario.js';

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

    // Tutor não pode solicitar consulta em data/horário que já passou
    if (req.usuarioRole === 'tutor' && new Date(dataConsulta) <= new Date()) {
      return res.status(400).json({
        message: 'Não é possível solicitar uma consulta em uma data/horário que já passou.',
      });
    }

    // Impede duas consultas do mesmo pet no mesmo horário (vale para tutor e admin)
    const conflito = await Consulta.findOne({
      petId,
      dataConsulta: new Date(dataConsulta),
      status: { $ne: 'Cancelada' },
    });

    if (conflito) {
      return res.status(400).json({
        message: 'Já existe uma consulta marcada para este pet nesta data e horário.',
      });
    }

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
    if (error.name === 'ValidationError') {
      const primeiraMensagem = Object.values(error.errors)[0].message;
      return res.status(400).json({ message: primeiraMensagem });
    }
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
    const { id } = req.params;
    const { petId, dataConsulta } = req.body;

    // Se a consulta está sendo remarcada, checa conflito com outra já existente
    if (petId && dataConsulta) {
      const conflito = await Consulta.findOne({
        _id: { $ne: id },
        petId,
        dataConsulta: new Date(dataConsulta),
        status: { $ne: 'Cancelada' },
      });

      if (conflito) {
        return res.status(400).json({
          message: 'Já existe uma consulta marcada para este pet nesta data e horário.',
        });
      }
    }

    // runValidators + context 'query' faz o findByIdAndUpdate respeitar
    // as validações do schema (por padrão ele ignora)
    const consultaAtualizada = await Consulta.findByIdAndUpdate(
      id,
      req.body,
      { returnDocument: 'after', runValidators: true, context: 'query' }
    );

    if (!consultaAtualizada) {
      return res.status(404).json({ message: 'Consulta não encontrada' });
    }

    res.status(200).json(consultaAtualizada);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const primeiraMensagem = Object.values(error.errors)[0].message;
      return res.status(400).json({ message: primeiraMensagem });
    }
    res.status(400).json({ message: error.message });
  }
};

export const deletarConsulta = async (req, res) => {
  try {
    const { id } = req.params;

    const consultaDeletada = await Consulta.findByIdAndDelete(id);

    if (!consultaDeletada) {
      return res.status(404).json({ message: 'Consulta não encontrada' });
    }

    // Remove em cascata o prontuário vinculado a esta consulta, se existir
    await Prontuario.deleteMany({ consultaId: id });

    res.status(200).json({ message: 'Consulta removida com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};