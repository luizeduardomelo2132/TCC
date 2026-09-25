import Prontuario from '../models/Prontuario.js';

const tratarErro = (error, res) => {
  if (error.name === 'ValidationError') {
    const mensagens = Object.values(error.errors).map((e) => e.message);
    return res.status(400).json({ message: mensagens.join(' ') });
  }
  if (error.code === 11000) {
    return res.status(409).json({
      message: 'Esta consulta já possui um prontuário registrado. Edite o prontuário existente em vez de criar um novo.',
    });
  }
  return res.status(500).json({ message: error.message });
};

export const criarProntuario = async (req, res) => {
  try {
    const {
      consultaId,
      diagnostico,
      prescricao,
      examesSolicitados,
      observacoes
    } = req.body;

    // Checagem amigável antes de tentar salvar (o índice único no schema
    // é a garantia real, isso aqui só evita um erro feio de duplicidade)
    const jaExiste = await Prontuario.findOne({ consultaId });
    if (jaExiste) {
      return res.status(409).json({
        message: 'Esta consulta já possui um prontuário registrado. Edite o prontuário existente em vez de criar um novo.',
      });
    }

    const novoProntuario = new Prontuario({
      consultaId,
      diagnostico,
      prescricao,
      examesSolicitados,
      observacoes,
    });

    const prontuarioSalvo = await novoProntuario.save();

    res.status(201).json(prontuarioSalvo);
  } catch (error) {
    tratarErro(error, res);
  }
};

export const listarProntuarios = async (req, res) => {
  try {
    const prontuarios = await Prontuario.find()
      .populate({
        path: 'consultaId',
        populate: {
          path: 'petId'
        },
      });

    res.status(200).json(prontuarios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listarProntuariosPorPet = async (req, res) => {
  try {
    const { petId } = req.params;

    const prontuarios = await Prontuario.find()
      .populate({
        path: 'consultaId',
        populate: {
          path: 'petId',
          populate: {
            path: 'tutorId',
            select: 'nome email telefone'
          }
        }
      });

    const prontuariosDoPet = prontuarios.filter((prontuario) => {
      const pet = prontuario.consultaId?.petId;

      if (!pet) {
        return false;
      }

      const petDoTutor =
        pet.tutorId?._id?.toString() === req.usuarioId?.toString();

      const petCorreto =
        pet._id?.toString() === petId;

      return petCorreto && petDoTutor;
    });

    res.status(200).json(prontuariosDoPet);
  } catch (error) {
    console.error('Erro ao buscar prontuários do pet:', error);

    res.status(500).json({
      message: error.message
    });
  }
};

export const buscarProntuarioPorConsulta = async (req, res) => {
  try {
    const prontuario = await Prontuario.findOne({
      consultaId: req.params.consultaId
    })
      .populate({
        path: 'consultaId',
        populate: {
          path: 'petId'
        },
      });

    res.status(200).json(prontuario);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const atualizarProntuario = async (req, res) => {
  try {
    const prontuario = await Prontuario.findById(req.params.id);

    if (!prontuario) {
      return res.status(404).json({ message: 'Prontuário não encontrado' });
    }

    // A consulta vinculada não pode ser trocada na edição — o campo consultaId
    // é ignorado de propósito, mesmo que venha no corpo da requisição
    const { diagnostico, prescricao, examesSolicitados, observacoes } = req.body;
    if (diagnostico !== undefined) prontuario.diagnostico = diagnostico;
    if (prescricao !== undefined) prontuario.prescricao = prescricao;
    if (examesSolicitados !== undefined) prontuario.examesSolicitados = examesSolicitados;
    if (observacoes !== undefined) prontuario.observacoes = observacoes;

    // save() roda as validações do schema (findByIdAndUpdate não roda por padrão)
    const prontuarioAtualizado = await prontuario.save();

    res.status(200).json(prontuarioAtualizado);
  } catch (error) {
    tratarErro(error, res);
  }
};

export const deletarProntuario = async (req, res) => {
  try {
    const prontuarioDeletado = await Prontuario.findByIdAndDelete(
      req.params.id
    );

    if (!prontuarioDeletado) {
      return res.status(404).json({
        message: 'Prontuário não encontrado'
      });
    }

    res.status(200).json({
      message: 'Prontuário removido com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};