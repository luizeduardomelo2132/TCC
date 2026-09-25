import mongoose from 'mongoose';

export const ESPECIES = ['Cão', 'Gato', 'Ave', 'Coelho', 'Roedor', 'Réptil', 'Outro'];

// Teto de idade (em anos) por espécie. Não é a expectativa de vida:
// é o limite acima do qual o valor é quase certamente erro de digitação.
export const IDADE_MAXIMA = {
    'Cão': 35,
    'Gato': 40,
    'Coelho': 20,
    'Roedor': 15,
    'Ave': 100,
    'Réptil': 200,
    'Outro': 200
};

const limiteDaEspecie = (especie) => IDADE_MAXIMA[especie] ?? 200;

// Precisa ter ao menos uma letra; permite letras (com acento), números, espaço, ponto, apóstrofo e hífen
const REGEX_NOME = /^(?=.*[A-Za-zÀ-ÿ])[A-Za-zÀ-ÿ0-9 .'\-]+$/;
// Raça: só letras, espaço, apóstrofo e hífen (sem números)
const REGEX_RACA = /^(?=.*[A-Za-zÀ-ÿ])[A-Za-zÀ-ÿ '\-]+$/;

const petSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'O nome do pet é obrigatório.'],
        trim: true,
        minlength: [2, 'O nome do pet deve ter pelo menos 2 caracteres.'],
        maxlength: [50, 'O nome do pet deve ter no máximo 50 caracteres.'],
        match: [REGEX_NOME, 'O nome do pet contém caracteres inválidos ou não pode ser só números.']
    },
    especie: {
        type: String,
        required: [true, 'A espécie é obrigatória.'],
        trim: true,
        enum: {
            values: ESPECIES,
            message: 'Espécie inválida.'
        }
    },
    raca: {
        type: String,
        required: [true, 'A raça é obrigatória.'],
        trim: true,
        minlength: [2, 'A raça deve ter pelo menos 2 caracteres.'],
        maxlength: [50, 'A raça deve ter no máximo 50 caracteres.'],
        match: [REGEX_RACA, 'A raça deve conter apenas letras.']
    },
    idadeAnos: {
        type: Number,
        required: [true, 'Informe a idade em anos (use 0 para pets com menos de 1 ano).'],
        min: [0, 'A idade não pode ser negativa.'],
        validate: [
            {
                validator: Number.isInteger,
                message: 'Os anos devem ser um número inteiro.'
            },
            {
                validator: function (v) {
                    return v <= limiteDaEspecie(this.especie);
                },
                message: 'Idade acima do limite plausível para a espécie selecionada.'
            }
        ]
    },
    idadeMeses: {
        type: Number,
        default: 0,
        min: [0, 'Os meses não podem ser negativos.'],
        max: [11, 'Os meses devem ficar entre 0 e 11 (a partir de 12 meses, some 1 ano).'],
        validate: {
            validator: Number.isInteger,
            message: 'Os meses devem ser um número inteiro.'
        }
    },
    tutorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'O tutor responsável é obrigatório.']
    }
});

// Regras que dependem de mais de um campo
// Regras que dependem de mais de um campo
petSchema.pre('validate', function () {
    // Não permite "0 anos e 0 meses"
    if (this.idadeAnos === 0 && this.idadeMeses === 0) {
        this.invalidate('idadeMeses', 'A idade não pode ser 0 anos e 0 meses. Informe ao menos 1 mês.');
    }

    // Se os anos já estão no teto da espécie, não sobra espaço para meses
    if (this.idadeAnos === limiteDaEspecie(this.especie) && this.idadeMeses > 0) {
        this.invalidate('idadeMeses', 'Idade acima do limite plausível para a espécie selecionada.');
    }
});

// Impede o mesmo tutor de ter dois pets com o mesmo nome (ignora maiúsculas/minúsculas)
// Atenção: se já existirem duplicados no banco, o índice não será criado até você limpá-los.
petSchema.index(
    { tutorId: 1, nome: 1 },
    { unique: true, collation: { locale: 'pt', strength: 2 } }
);

export default mongoose.model('Pet', petSchema);