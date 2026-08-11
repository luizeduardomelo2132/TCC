import express from 'express';
import * as TutorController from '../controllers/TutorController.js';
import { verificarToken, apenasCargos } from '../middlewares/auth.js';

const router = express.Router();

// Apenas Recepção e Veterinários gerenciam o cadastro de tutores
const cargosPermitidos = apenasCargos(['admin', 'veterinario']);

router.post('/', verificarToken, cargosPermitidos, TutorController.criarTutor);
router.get('/', verificarToken, cargosPermitidos, TutorController.listarTutores);
router.get('/:id', verificarToken, cargosPermitidos, TutorController.obterTutor);
router.put('/:id', verificarToken, cargosPermitidos, TutorController.atualizarTutor);
router.delete('/:id', verificarToken, cargosPermitidos, TutorController.deleteTutor);

export default router;