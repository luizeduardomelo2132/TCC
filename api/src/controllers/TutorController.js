import Usuario from '../models/Usuario.js';
import Pet from '../models/Pet.js';
import Consulta from '../models/Consulta.js';

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

    // 1. Busca os pets do tutor para mapear os IDs antes de deletá-los
    const petsDoTutor = await Pet.find({
      $or: [{ tutorId: id }, { tutor: id }]
    });

    const petIds = petsDoTutor.map((pet) => pet._id);

    // 2. Se o tutor tiver pets, remove todas as consultas associadas a esses pets
    if (petIds.length > 0) {
      await Consulta.deleteMany({
        $or: [{ pet: { $in: petIds } }, { petId: { $in: petIds } }]
      });
    }

    // 3. Remove em cascata todos os pets do tutor
    await Pet.deleteMany({
      $or: [{ tutorId: id }, { tutor: id }]
    });

    // 4. Remove o tutor do banco de dados
    const tutor = await Usuario.findByIdAndDelete(id);

    if (!tutor) {
      return res.status(404).json({ erro: 'Tutor não encontrado' });
    }

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