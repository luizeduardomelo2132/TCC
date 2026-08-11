import Pet from '../models/Pet.js';

export const criarPet = async (req, res) => {
  try {
    let { nome, especie, raca, idade, tutorId } = req.body;
    
    if (req.usuarioRole === 'tutor') {
      tutorId = req.usuarioId;
    }

    const novoPet = new Pet({ nome, especie, raca, idade, tutorId });
    const petSalvo = await novoPet.save();
    
    res.status(201).json(petSalvo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const listarPets = async (req, res) => {
  try {
    let filtro = {};

    if (req.usuarioRole === 'tutor') {
      filtro = { tutorId: req.usuarioId }; 
    }

    const pets = await Pet.find(filtro);
    
    res.status(200).json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const buscarPetPorId = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: 'Pet não encontrado' });
    
    res.status(200).json(pet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const atualizarPet = async (req, res) => {
  try {
    const petAtualizado = await Pet.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true } 
    );
    
    if (!petAtualizado) return res.status(404).json({ message: 'Pet não encontrado' });
    
    res.status(200).json(petAtualizado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deletarPet = async (req, res) => {
  try {
    const petDeletado = await Pet.findByIdAndDelete(req.params.id);
    
    if (!petDeletado) return res.status(404).json({ message: 'Pet não encontrado' });
    
    res.status(200).json({ message: 'Pet deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};