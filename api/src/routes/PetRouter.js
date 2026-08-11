import express from 'express';
import * as PetController from '../controllers/PetController.js';
import { verificarToken, apenasCargos } from '../middlewares/auth.js';

const router = express.Router();

// Permissão para buscar e criar (O Controller já cuida para o Tutor só ver/criar o dele)
const permissaoGeral = apenasCargos(['admin', 'veterinario', 'tutor']);

// Permissão restrita para alterar ou apagar o cadastro do pet
const permissaoRestrita = apenasCargos(['admin', 'veterinario']);

router.post('/', verificarToken, permissaoGeral, PetController.criarPet);
router.get('/', verificarToken, permissaoGeral, PetController.listarPets);
router.get('/:id', verificarToken, permissaoGeral, PetController.buscarPetPorId);

// Mantemos o bloqueio no PUT e DELETE para o Tutor não fazer bagunça
router.put('/:id', verificarToken, permissaoRestrita, PetController.atualizarPet);
router.delete('/:id', verificarToken, permissaoRestrita, PetController.deletarPet);

export default router;