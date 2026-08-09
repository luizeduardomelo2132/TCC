import mongoose from 'mongoose';

const prontuarioSchema = new mongoose.Schema({
  consultaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consulta',
    required: true,
  },
  diagnostico: {
    type: String,
    required: true,
  },
  prescricao: {
    type: String,
    required: false,
  },
  examesSolicitados: {
    type: String,
    required: false,
  },
  observacoes: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Prontuario', prontuarioSchema);