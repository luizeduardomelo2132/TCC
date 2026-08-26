import express from 'express';

import * as UsuarioController from '../controllers/UsuarioController.js';

import {
  verificarToken,
  apenasCargos
} from '../middlewares/auth.js';

const router = express.Router();

// ==========================================
// ADMIN
// ==========================================

router.get(
  '/',
  verificarToken,
  apenasCargos(['admin']),
  UsuarioController.listarUsuarios
);

router.delete(
  '/:id',
  verificarToken,
  apenasCargos(['admin']),
  UsuarioController.deletarVeterinario
);

// ==========================================
// VETERINÁRIOS
// Tutor também pode consultar os veterinários
// disponíveis para realizar agendamento.
// ==========================================

router.get(
  '/veterinarios',
  verificarToken,
  apenasCargos([
    'admin',
    'veterinario',
    'tutor'
  ]),
  UsuarioController.listarVeterinarios
);

export default router;