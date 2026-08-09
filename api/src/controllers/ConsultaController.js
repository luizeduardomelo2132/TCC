import Consulta from '../models/Consulta.js';

export const criarConsulta = async (req, res) => {
  try {
    const { dataConsulta, motivo, pesoAtual, petId } = req.body;
    
    const novaConsulta = new Consulta({ dataConsulta, motivo, pesoAtual, petId });
    const consultaSalva = await novaConsulta.save();
    
    res.status(201).json(consultaSalva);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const listarConsultas = async (req, res) => {
  try {
    const consultas = await Consulta.find().populate('petId');
    res.status(200).json(consultas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const buscarConsultaPorId = async (req, res) => {
  try {
    const consulta = await Consulta.findById(req.params.id).populate('petId');
    if (!consulta) return res.status(404).json({ message: 'Consulta não encontrada' });
    
    res.status(200).json(consulta);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const atualizarConsulta = async (req, res) => {
  try {
    const consultaAtualizada = await Consulta.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true } 
    );
    
    if (!consultaAtualizada) return res.status(404).json({ message: 'Consulta não encontrada' });
    
    res.status(200).json(consultaAtualizada);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deletarConsulta = async (req, res) => {
  try {
    const consultaDeletada = await Consulta.findByIdAndDelete(req.params.id);
    
    if (!consultaDeletada) return res.status(404).json({ message: 'Consulta não encontrada' });
    
    res.status(200).json({ message: 'Consulta deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};