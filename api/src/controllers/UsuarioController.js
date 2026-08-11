import Usuario from '../models/Usuario.js';

export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-senha'); 
    
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};