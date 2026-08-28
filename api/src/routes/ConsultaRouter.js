import express from 'express';
import * as ProntuarioController from '../controllers/ProntuarioController.js';
import { verificarToken, apenasCargos } from '../middlewares/auth.js';

const router = express.Router();

// Permite 'tutor', 'Tutor', 'admin', 'Admin', 'veterinario', 'Veterinario'
const cargosLeitura = ['veterinario', 'Veterinario', 'admin', 'Admin', 'tutor', 'Tutor'];
const cargosEscrita = ['veterinario', 'Veterinario', 'admin', 'Admin'];

router.post(
  '/',
  verificarToken,
  apenasCargos(cargosEscrita),
  ProntuarioController.criarProntuario
);

router.get(
  '/',
  verificarToken,
  apenasCargos(cargosLeitura),
  ProntuarioController.listarProntuarios
);

router.get(
  '/pet/:petId',
  verificarToken,
  apenasCargos(cargosLeitura),
  ProntuarioController.listarProntuariosPorPet
);

router.get(
  '/consulta/:consultaId',
  verificarToken,
  apenasCargos(cargosLeitura),
  ProntuarioController.buscarProntuarioPorConsulta
);

router.put(
  '/:id',
  verificarToken,
  apenasCargos(cargosEscrita),
  ProntuarioController.atualizarProntuario
);

router.delete(
  '/:id',
  verificarToken,
  apenasCargos(cargosEscrita),
  ProntuarioController.deletarProntuario
);

export default router;