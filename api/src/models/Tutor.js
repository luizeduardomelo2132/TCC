import mongoose from 'mongoose';

const tutorSchema = new mongoose.Schema({
  nome: { 
    type: String, 
    required: true 
  },
  telefone: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true // Garante que não teremos dois tutores com o mesmo e-mail
  },
  endereco: { 
    type: String, 
    required: false 
  }
}, { 
  timestamps: true // Cria automaticamente a data de criação e atualização no banco
});

export default mongoose.model('Tutor', tutorSchema);