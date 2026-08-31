// ConsultaRoutes.js
import express from 'express';
import * as ConsultaController from '../controllers/ConsultaController.js';
import { verificarToken, apenasCargos } from '../middlewares/auth.js';

const router = express.Router();

const cargosLeitura = ['veterinario', 'Veterinario', 'admin', 'Admin', 'tutor', 'Tutor'];
const cargosCriacao = ['tutor', 'Tutor', 'admin', 'Admin'];
const cargosGestao = ['admin', 'Admin']; // aprovar / editar / excluir
const cargosVeterinario = ['veterinario', 'Veterinario'];

router.post(
  '/',
  verificarToken,
  apenasCargos(cargosCriacao),
  ConsultaController.criarConsulta
);

// Precisa vir antes de '/:id' — caminho fixo primeiro, senão o Express
// tentaria interpretar "minha-agenda-hoje" como um :id.
router.get(
  '/minha-agenda-hoje',
  verificarToken,
  apenasCargos(cargosVeterinario),
  ConsultaController.minhaAgendaHoje
);

router.get(
  '/',
  verificarToken,
  apenasCargos(cargosLeitura),
  ConsultaController.listarConsultas
);

router.put(
  '/:id',
  verificarToken,
  apenasCargos(cargosGestao),
  ConsultaController.atualizarConsulta
);

router.delete(
  '/:id',
  verificarToken,
  apenasCargos(cargosGestao),
  ConsultaController.deletarConsulta
);

export default router;