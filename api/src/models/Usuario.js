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
    enum: ['admin', 'veterinario', 'tutor'],
    default: 'tutor',
    required: true,
  },
  senhaTemporaria: {
    type: Boolean,
    default: false,
  },

  telefone: {
    type: String
  }, 
  endereco: {
    type: String
  }, 
  especialidade: {
    type: String,
    required: false,
    trim: true, },
}, { timestamps: true });

usuarioSchema.pre('save', async function () {
  if (!this.isModified('senha')) return;

  const hash = await bcrypt.hash(this.senha, 10);
  this.senha = hash;
});

export default mongoose.model('Usuario', usuarioSchema);