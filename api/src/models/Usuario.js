import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const usuarioSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  senha: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'veterinario', 'tutor'], // Só aceita esses 3 valores
    default: 'tutor', // Se não enviar nada, vira tutor por padrão
    required: true,
  },
}, { timestamps: true });

// Função que roda antes de salvar no banco para criptografar a senha
usuarioSchema.pre('save', async function () {
  if (!this.isModified('senha')) return;
  
  const hash = await bcrypt.hash(this.senha, 10);
  this.senha = hash;
  
});

export default mongoose.model('Usuario', usuarioSchema);