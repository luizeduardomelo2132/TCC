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

  tipo_de_atendimento: {
    type: String,
    required: false,
    default: 'Consulta Normal'
  },

  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },

  veterinarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: false // Torna opcional para a solicitação inicial do tutor
  },

  status: {
    type: String,
    enum: [
      'Pendente',
      'pendente',
      'agendada',
      'Agendada',
      'Confirmada',
      'confirmada',
      'em_andamento',
      'concluida',
      'Concluída',
      'cancelada',
      'Cancelada'
    ],
    default: 'Pendente'
  }
}, {
  timestamps: true
});

export default mongoose.models.Consulta || mongoose.model('Consulta', consultaSchema);