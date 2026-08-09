import express from 'express';
import * as ConsultaController from '../controllers/ConsultaController.js';    

const router = express.Router();

router.get('/', ConsultaController.listarConsultas);
router.get('/:id', ConsultaController.buscarConsultaPorId);
router.post('/', ConsultaController.criarConsulta);
router.put('/:id', ConsultaController.atualizarConsulta);
router.delete('/:id', ConsultaController.deletarConsulta);

export default router;