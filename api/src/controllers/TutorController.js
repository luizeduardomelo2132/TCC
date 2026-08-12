import Usuario from '../models/Usuario.js';

export const criarTutor = async (req, res) => {
  try {
    const { nome, telefone, email, endereco } = req.body;

    
    const novoTutor = await Usuario.create({ 
      nome, 
      email, 
      telefone, 
      endereco, 
      role: 'tutor',
      senha: '123456' 
    });

    return res.status(201).json(novoTutor);
  } catch (error) {
    return res.status(400).json({ erro: 'Falha ao cadastrar tutor', detalhes: error.message });
  }
};

export const listarTutores = async (req, res) => {
  try {
    
    const tutores = await Usuario.find({ role: 'tutor' }).select('-senha');
    return res.status(200).json(tutores);
  } catch (error) {
    return res.status(500).json({ erro: 'Falha ao listar tutores', detalhes: error.message });
  }
};

export const deleteTutor = async (req, res) => {
  try {
    const { id } = req.params;
    const tutor = await Usuario.findByIdAndDelete(id);
    return res.status(200).json(tutor);
  } catch (error) {
    return res.status(500).json({ erro: 'Falha ao deletar tutor', detalhes: error.message });
  }
};

export const obterTutor = async (req, res) => {
  try {
    const { id } = req.params;
    const tutor = await Usuario.findById(id).select('-senha');
    return res.status(200).json(tutor);
  } catch (error) {
    return res.status(500).json({ erro: 'Falha ao obter tutor', detalhes: error.message });
  }
};

export const atualizarTutor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, email, endereco } = req.body;
    const tutor = await Usuario.findByIdAndUpdate(
      id, 
      { nome, telefone, email, endereco }, 
      { new: true }
    ).select('-senha');
    return res.status(200).json(tutor);
  } catch (error) {
    return res.status(500).json({ erro: 'Falha ao atualizar tutor', detalhes: error.message });
  }
};