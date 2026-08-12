import mongoose from 'mongoose';

const petSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    especie: {
        type: String,
        required: true
    },
    raca: {
        type: String,
        required: true
    },
    idade: {
        type: Number,
        required: true
    },
    tutorId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Usuario',
        required: true
    }
});

export default mongoose.model('Pet', petSchema);