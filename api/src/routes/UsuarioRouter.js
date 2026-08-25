import express from 'express';

import * as UsuarioController from '../controllers/UsuarioController.js';

import { verificarToken, apenasCargos } from '../middlewares/auth.js';

const router = express.Router();

const cargosPermitidos = apenasCargos(['admin']);

router.get('/', verificarToken, cargosPermitidos,UsuarioController.listarUsuarios);
router.delete( '/:id', verificarToken, cargosPermitidos, UsuarioController.deletarVeterinario);

export default router;