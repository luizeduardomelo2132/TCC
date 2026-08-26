import express from 'express';

import * as ConsultaController from '../controllers/ConsultaController.js';

import {
  verificarToken,
  apenasCargos
} from '../middlewares/auth.js';

const router = express.Router();

const cargosPermitidos = apenasCargos([
  'admin',
  'veterinario',
  'tutor'
]);

router.post( '/', verificarToken, cargosPermitidos, ConsultaController.criarConsulta);
router.get( '/', verificarToken, cargosPermitidos, ConsultaController.listarConsultas);
router.get( '/:id', verificarToken, cargosPermitidos, ConsultaController.buscarConsultaPorId);
router.put( '/:id', verificarToken, apenasCargos(['admin', 'veterinario']), ConsultaController.atualizarConsulta);
router.delete( '/:id', verificarToken, apenasCargos(['admin', 'veterinario']), ConsultaController.deletarConsulta);

export default router;