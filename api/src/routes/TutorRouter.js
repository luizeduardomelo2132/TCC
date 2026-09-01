import express from 'express';

import * as UsuarioController from '../controllers/UsuarioController.js';

import { verificarToken, apenasCargos } from '../middlewares/auth.js';

const router = express.Router();

const cargosPermitidos = apenasCargos(['admin']);

// ==========================================
// GESTÃO DE TUTORES (admin)
// ==========================================

router.post('/', verificarToken, cargosPermitidos, UsuarioController.criarTutor);
router.get('/', verificarToken, cargosPermitidos, UsuarioController.listarTutores);
router.get('/:id', verificarToken, cargosPermitidos, UsuarioController.obterTutor);
router.put('/:id', verificarToken, cargosPermitidos, UsuarioController.atualizarTutor);
router.delete('/:id', verificarToken, cargosPermitidos, UsuarioController.deleteTutor);

export default router;