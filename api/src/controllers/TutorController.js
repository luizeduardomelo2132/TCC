import Tutor from '../models/Tutor.js';

// Função para criar um novo tutor (CREATE)
export const criarTutor = async (req, res) => {
  try {
    // Recebe os dados digitados pelo usuário
    const { nome, telefone, email, endereco } = req.body;

    // Manda o Mongoose salvar no MongoDB
    const novoTutor = await Tutor.create({ nome, telefone, email, endereco });

    // Devolve uma resposta de sucesso (Status 201: Criado)
    return res.status(201).json(novoTutor);
  } catch (error) {
    // Se der erro (ex: faltou o nome, ou e-mail repetido), devolve erro 400
    return res.status(400).json({ erro: 'Falha ao cadastrar tutor', detalhes: error.message });
  }
};

export const listarTutores = async (req, res) => {
  try {
    const tutores = await Tutor.find();
    return res.status(200).json(tutores);
  } catch (error) {
    return res.status(500).json({ erro: 'Falha ao listar tutores', detalhes: error.message });
  }
};

export const deleteTutor = async (req, res) => {
  try {
    const { id } = req.params;
    const tutor = await Tutor.findByIdAndDelete(id);
    return res.status(200).json(tutor);
  } catch (error) {
    return res.status(500).json({ erro: 'Falha ao deletar tutor', detalhes: error.message });
  }
};

export const obterTutor = async (req, res) => {
  try {
    const { id } = req.params;
    const tutor = await Tutor.findById(id);
    return res.status(200).json(tutor);
  } catch (error) {
    return res.status(500).json({ erro: 'Falha ao obter tutor', detalhes: error.message });
  }
};

export const atualizarTutor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, email, endereco } = req.body;
    const tutor = await Tutor.findByIdAndUpdate(id, { nome, telefone, email, endereco }, { new: true });
    return res.status(200).json(tutor);
  } catch (error) {
    return res.status(500).json({ erro: 'Falha ao atualizar tutor', detalhes: error.message });
  }
};
