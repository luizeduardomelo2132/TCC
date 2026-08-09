import Pet from '../models/Pet.js';

export const criarPet = async (req, res) => {
  try {
    const { nome, especie, raca, idade, tutorId } = req.body;
    
    const novoPet = new Pet({ nome, especie, raca, idade, tutorId });
    const petSalvo = await novoPet.save();
    
    res.status(201).json(petSalvo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const listarPets = async (req, res) => {
  try {
    const pets = await Pet.find().populate('tutorId', 'nome');
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