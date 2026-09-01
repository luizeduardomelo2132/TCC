 import express from 'express';

import * as ProntuarioController from '../controllers/ProntuarioController.js';

import { verificarToken, apenasCargos } from '../middlewares/auth.js';

const router = express.Router();

router.post( '/', verificarToken, apenasCargos(['veterinario']), ProntuarioController.criarProntuario);

router.get( '/', verificarToken, apenasCargos(['veterinario']), ProntuarioController.listarProntuarios);

router.get( '/pet/:petId', verificarToken, apenasCargos(['veterinario', 'tutor']), ProntuarioController.listarProntuariosPorPet);

router.get( '/consulta/:consultaId', verificarToken, apenasCargos(['veterinario']), ProntuarioController.buscarProntuarioPorConsulta);

router.put( '/:id', verificarToken, apenasCargos(['veterinario']), ProntuarioController.atualizarProntuario);

router.delete( '/:id', verificarToken, apenasCargos(['veterinario']), ProntuarioController.deletarProntuario);

export default router;