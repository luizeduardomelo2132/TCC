import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const usuarioSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    validate: [
      {
        validator: function (v) {
          return /^[A-Za-zÀ-ÿ\s]+$/.test(v);
        },
        message: 'O nome não pode conter números ou símbolos.',
      },
      {
        validator: function (v) {
          const letras = (v.match(/[A-Za-zÀ-ÿ]/g) || []).length;
          return letras >= 4;
        },
        message: 'O nome deve ter no mínimo 4 letras.',
      },
    ],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[A-Za-zÀ-ÿ]{3,}[A-Za-zÀ-ÿ0-9._%+-]*@[^\s@]+\.[^\s@]+$/,
      'O e-mail deve começar com pelo menos 3 letras antes do @. e deve ter um ".com"',
    ],
  },
  senha: {
    type: String,
    required: true,
    minlength: [6, 'A senha deve ter no mínimo 6 caracteres.'],
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
    type: String,
    required: [true, 'O telefone é obrigatório.'],
    validate: {
      validator: function (v) {
        return v.length >= 8 && v.length <= 20;
      },
      message: 'O telefone deve ter entre 8 e 20 caracteres.',
    },
  },
  endereco: {
    type: String,
    required: [true, 'O endereço é obrigatório.'],
    validate: {
      validator: function (v) {
        const totalLetras = (v.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
        return totalLetras >= 8;
      },
      message: 'O endereço deve ter no mínimo 8 letras.',
    },
  },
  especialidade: {
    type: String,
    trim: true,
    required: [
      function () {
        return this.role === 'veterinario';
      },
      'A especialidade é obrigatória para veterinários.',
    ],
  },
}, { timestamps: true });

usuarioSchema.pre('save', async function () {
  if (!this.isModified('senha')) return;

  const hash = await bcrypt.hash(this.senha, 10);
  this.senha = hash;
});

export default mongoose.model('Usuario', usuarioSchema);