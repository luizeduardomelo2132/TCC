import express from 'express';
import * as PetController from '../controllers/PetController.js';

const router = express.Router();

router.get('/', PetController.listarPets);
router.get('/:id', PetController.buscarPetPorId);
router.post('/', PetController.criarPet);
router.put('/:id', PetController.atualizarPet);
router.delete('/:id', PetController.deletarPet);

export default router;