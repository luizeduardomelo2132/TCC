import mongoose from 'mongoose';

const consultaSchema = new mongoose.Schema({
  dataConsulta: {
    type: Date,
    required: true
  },
  motivo: {
    type: String,
    required: true
  },
  pesoAtual: {
    type: Number,
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

}, {
  timestamps: true
});

export default mongoose.model('Consulta', consultaSchema);