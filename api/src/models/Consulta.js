import mongoose from 'mongoose';

const consultaSchema = new mongoose.Schema({
  dataConsulta: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return value > new Date();
      },
      message: 'A data e hora da consulta não podem estar no passado.'
    }
  },

  motivo: {
    type: String,
    required: true,
    trim: true,
    minlength: [5, 'O motivo da consulta deve ter no mínimo 5 caracteres.'],
  },

  pesoAtual: {
    type: Number,
    required: false,
    min: [1, 'O peso deve ser de no mínimo 1 kg.'],
    max: [200, 'O peso deve ser de no máximo 200 kg.'],
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
    required: false
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