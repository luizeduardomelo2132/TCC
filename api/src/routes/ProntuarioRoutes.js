import express from 'express';
import * as ProntuarioController from '../controllers/ProntuarioController.js';

const router = express.Router();

router.post('/', ProntuarioController.criarProntuario);
router.get('/', ProntuarioController.listarProntuarios);
router.get('/consulta/:consultaId', ProntuarioController.buscarProntuarioPorConsulta);
router.put('/:id', ProntuarioController.atualizarProntuario);
router.delete('/:id', ProntuarioController.deletarProntuario);

export default router;