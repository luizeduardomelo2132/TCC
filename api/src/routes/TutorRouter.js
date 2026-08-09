import express from 'express';
import * as TutorController from '../controllers/TutorController.js';

const router = express.Router();

router.post('/', TutorController.criarTutor);
router.get('/', TutorController.listarTutores);
router.get('/:id', TutorController.obterTutor);
router.put('/:id', TutorController.atualizarTutor);
router.delete('/:id', TutorController.deleteTutor);

export default router;