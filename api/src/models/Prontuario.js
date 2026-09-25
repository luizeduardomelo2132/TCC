import mongoose from 'mongoose';

const REGEX_TEM_LETRA = /[a-zA-ZÀ-ÿ]/;

const prontuarioSchema = new mongoose.Schema({
  consultaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consulta',
    required: true,
    unique: true, // uma consulta só pode ter um prontuário
  },
  diagnostico: {
    type: String,
    required: true,
    trim: true,
    minlength: [10, 'O diagnóstico deve ter no mínimo 10 caracteres.'],
    validate: {
      validator: (v) => REGEX_TEM_LETRA.test(v),
      message: 'O diagnóstico não pode conter apenas números.',
    },
  },
  prescricao: {
    type: String,
    required: false,
    trim: true,
    validate: {
      validator: function (v) {
        if (!v) return true;
        return REGEX_TEM_LETRA.test(v);
      },
      message: 'A prescrição não pode conter apenas números.',
    },
  },
  examesSolicitados: {
    type: String,
    required: false,
    trim: true,
    validate: {
      validator: function (v) {
        if (!v) return true;
        return REGEX_TEM_LETRA.test(v);
      },
      message: 'Os exames solicitados não podem conter apenas números.',
    },
  },
  observacoes: {
    type: String,
    required: false,
    trim: true,
    validate: {
      validator: function (v) {
        if (!v) return true;
        return REGEX_TEM_LETRA.test(v);
      },
      message: 'As observações não podem conter apenas números.',
    },
  },
}, {
  timestamps: true,
});

export default mongoose.model('Prontuario', prontuarioSchema);