import Prontuario from '../models/Prontuario.js';

export const criarProntuario = async (req, res) => {
  try {
    const { consultaId, diagnostico, prescricao, examesSolicitados, observacoes } = req.body;

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
    const prontuarios = await Prontuario.find()
      .populate({
        path: 'consultaId',
        populate: { path: 'petId' },
      });
    res.status(200).json(prontuarios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const buscarProntuarioPorConsulta = async (req, res) => {
  try {
    const prontuario = await Prontuario.findOne({ consultaId: req.params.consultaId })
      .populate({
        path: 'consultaId',
        populate: { path: 'petId' },
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
      return res.status(404).json({ message: 'Prontuário não encontrado' });
    }

    res.status(200).json(prontuarioAtualizado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deletarProntuario = async (req, res) => {
  try {
    const prontuarioDeletado = await Prontuario.findByIdAndDelete(req.params.id);

    if (!prontuarioDeletado) {
      return res.status(404).json({ message: 'Prontuário não encontrado' });
    }

    res.status(200).json({ message: 'Prontuário removido com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};