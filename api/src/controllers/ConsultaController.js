import Prontuario from '../models/Prontuario.js';

export const criarProntuario = async (req, res) => {
  try {
    const {
      consultaId,
      diagnostico,
      prescricao,
      examesSolicitados,
      observacoes
    } = req.body;

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
    res.status(400).json({ message: error.message });
  }
};

export const listarProntuarios = async (req, res) => {
  try {
    const petIdQuery = req.query.pet || req.query.petId;

    const prontuarios = await Prontuario.find()
      .populate({
        path: 'consultaId',
        populate: {
          path: 'petId',
          populate: {
            path: 'tutorId',
            select: 'nome email telefone'
          }
        },
      });

    let resultado = prontuarios;

    // Filtra por PET se o id for passado via Query Parameter (?pet=... ou ?petId=...)
    if (petIdQuery) {
      resultado = resultado.filter((prontuario) => {
        const pet = prontuario.consultaId?.petId;
        return pet && pet._id?.toString() === petIdQuery.toString();
      });
    }

    // Se quem está acessando for Tutor, garante que ele só veja prontuários dos seus pets
    if (req.usuarioRole === 'tutor') {
      resultado = resultado.filter((prontuario) => {
        const pet = prontuario.consultaId?.petId;
        if (!pet) return false;

        const tutorId =
          pet.tutorId?._id?.toString() ||
          pet.tutorId?.toString() ||
          pet.tutor?.toString();

        return tutorId === req.usuarioId?.toString();
      });
    }

    res.status(200).json(resultado);
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

      const petCorreto = pet._id?.toString() === petId.toString();

      // Validação de tutor
      if (req.usuarioRole === 'tutor') {
        const tutorId =
          pet.tutorId?._id?.toString() ||
          pet.tutorId?.toString() ||
          pet.tutor?.toString();

        const petDoTutor = tutorId === req.usuarioId?.toString();
        return petCorreto && petDoTutor;
      }

      // Veterinário e Admin visualizam sem restrição de propriedade
      return petCorreto;
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
    const prontuarioAtualizado = await Prontuario.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!prontuarioAtualizado) {
      return res.status(404).json({
        message: 'Prontuário não encontrado'
      });
    }

    res.status(200).json(prontuarioAtualizado);
  } catch (error) {
    res.status(400).json({ message: error.message });
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