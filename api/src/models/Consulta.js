import mongoose from 'mongoose';

const consultaSchema = new mongoose.Schema({
  dataConsulta: {
    type: Date,
    required: true
  },

  dataHorario: {
    type: Date,
    required: false
  },

  motivo: {
    type: String,
    required: true
  },

  pesoAtual: {
    type: Number,
    required: false
  },

  observacoes: {
    type: String,
    required: false
  },

  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },

  veterinarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },

  status: {
    type: String,
    enum: ['agendada', 'em_andamento', 'concluida', 'cancelada'],
    default: 'agendada'
  }
}, {
  timestamps: true
});

export default mongoose.model('Consulta', consultaSchema);