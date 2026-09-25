import mongoose from 'mongoose';
import Pet from '../models/Pet.js';
import Usuario from '../models/Usuario.js'; // ajuste o caminho/nome conforme o seu projeto
import Consulta from '../models/Consulta.js';

const idValido = (id) => mongoose.Types.ObjectId.isValid(id);

// Um tutor só pode mexer nos próprios pets
const podeAcessar = (req, pet) => {
  if (req.usuarioRole !== 'tutor') return true;
  const donoId = String(pet.tutorId?._id ?? pet.tutorId);
  return donoId === String(req.usuarioId);
};

// Confere se o tutor existe e é mesmo um tutor
const tutorValido = async (tutorId) => {
  if (!idValido(tutorId)) return false;
  const tutor = await Usuario.findById(tutorId).select('role'); // ajuste o nome do campo 'role' se for diferente
  return !!tutor && tutor.role === 'tutor';
};

const tratarErro = (error, res) => {
  // ADICIONE ESTA LINHA:
  console.error("ERRO COMPLETO:", error);

  if (error.name === 'ValidationError') {
    const mensagens = Object.values(error.errors).map((e) => e.message);
    return res.status(400).json({ message: mensagens.join(' '), errors: mensagens });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: 'Este tutor já possui um pet com esse nome.' });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Identificador ou valor inválido.' });
  }

  // Opcional: envie a mensagem original do erro pro Postman/Insomnia pra facilitar:
  // return res.status(500).json({ message: 'Erro interno do servidor.', detalhe: error.message });

  return res.status(500).json({ message: 'Erro interno do servidor.' });
};

export const criarPet = async (req, res) => {
  try {
    if (req.usuarioRole === 'veterinario') {
      return res.status(403).json({ message: 'Veterinários não podem cadastrar pets.' });
    }

    let { nome, especie, raca, idadeAnos, idadeMeses, tutorId } = req.body;

    if (req.usuarioRole === 'tutor') {
      tutorId = req.usuarioId;
    }

    if (!(await tutorValido(tutorId))) {
      return res.status(400).json({ message: 'Tutor informado não existe.' });
    }

    const novoPet = new Pet({ nome, especie, raca, idadeAnos, idadeMeses, tutorId });
    const petSalvo = await novoPet.save();

    res.status(201).json(petSalvo);
  } catch (error) {
    tratarErro(error, res);
  }
};

export const listarPets = async (req, res) => {
  try {
    let filtro = {};

    if (req.usuarioRole === 'tutor') {
      filtro = { tutorId: req.usuarioId };
    }

    // Veterinário só pode ver pets com consulta CONFIRMADA vinculada a ele
    if (req.usuarioRole === 'veterinario') {
      const idsPetsDoVet = await Consulta.distinct('petId', {
        veterinarioId: req.usuarioId,
        status: 'Confirmada',
      });
      filtro = { _id: { $in: idsPetsDoVet } };
    }

    const pets = await Pet.find(filtro).populate('tutorId', 'nome email telefone');

    res.status(200).json(pets);
  } catch (error) {
    tratarErro(error, res);
  }
};

export const buscarPetPorId = async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({ message: 'ID de pet inválido.' });
    }

    const pet = await Pet.findById(req.params.id).populate('tutorId', 'nome email telefone');

    if (!pet) {
      return res.status(404).json({ message: 'Pet não encontrado' });
    }

    if (!podeAcessar(req, pet)) {
      return res.status(403).json({ message: 'Você não tem permissão para ver este pet.' });
    }

    res.status(200).json(pet);
  } catch (error) {
    tratarErro(error, res);
  }
};

export const atualizarPet = async (req, res) => {
  try {
    if (req.usuarioRole === 'veterinario') {
      return res.status(403).json({ message: 'Veterinários não podem editar pets.' });
    }

    if (!idValido(req.params.id)) {
      return res.status(400).json({ message: 'ID de pet inválido.' });
    }

    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: 'Pet não encontrado' });

    if (!podeAcessar(req, pet)) {
      return res.status(403).json({ message: 'Você não tem permissão para editar este pet.' });
    }

    // Só aceita os campos permitidos (evita alterar campos indevidos)
    const { nome, especie, raca, idadeAnos, idadeMeses, tutorId } = req.body;
    if (nome !== undefined) pet.nome = nome;
    if (especie !== undefined) pet.especie = especie;
    if (raca !== undefined) pet.raca = raca;
    if (idadeAnos !== undefined) pet.idadeAnos = idadeAnos;
    if (idadeMeses !== undefined) pet.idadeMeses = idadeMeses;

    // Tutor não pode transferir o pet para outra pessoa
    if (req.usuarioRole !== 'tutor' && tutorId !== undefined) {
      if (!(await tutorValido(tutorId))) {
        return res.status(400).json({ message: 'Tutor informado não existe.' });
      }
      pet.tutorId = tutorId;
    }

    // save() roda todas as validações do schema (findByIdAndUpdate não roda por padrão)
    const petAtualizado = await pet.save();

    res.status(200).json(petAtualizado);
  } catch (error) {
    tratarErro(error, res);
  }
};

export const deletarPet = async (req, res) => {
  try {
    if (req.usuarioRole === 'veterinario') {
      return res.status(403).json({ message: 'Veterinários não podem excluir pets.' });
    }

    if (!idValido(req.params.id)) {
      return res.status(400).json({ message: 'ID de pet inválido.' });
    }

    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: 'Pet não encontrado' });

    if (!podeAcessar(req, pet)) {
      return res.status(403).json({ message: 'Você não tem permissão para excluir este pet.' });
    }

    // Bloqueia exclusão se o pet tiver consultas ou prontuários vinculados.
    // Descomente e ajuste os nomes dos models/campos conforme o seu projeto:
    //
    // const temConsulta = await Consulta.exists({ pet: pet._id });
    // const temProntuario = await Prontuario.exists({ pet: pet._id });
    // if (temConsulta || temProntuario) {
    //   return res.status(409).json({
    //     message: 'Não é possível excluir: este pet possui consultas ou prontuários vinculados.'
    //   });
    // }

    // Remove as consultas vinculadas ao pet
    await Consulta.deleteMany({ petId: pet._id });

    // Remove o pet
    await pet.deleteOne();

    res.status(200).json({ message: 'Pet deletado com sucesso' });
  } catch (error) {
    tratarErro(error, res);
  }
};