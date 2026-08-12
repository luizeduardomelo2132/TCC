
import Consulta from '../models/Consulta.js';
import Pet from '../models/Pet.js';

// 1. Criar Consulta
export const criarConsulta = async (req, res) => {
  try {
    const {
      petId,
      veterinarioId,
      dataHorario,
      dataConsulta,
      observacoes,
      motivo,
      pesoAtual,
      status
    } = req.body;

    // Aceita dataHorario ou dataConsulta
    const dataFinal = dataHorario || dataConsulta;

    if (!dataFinal) {
      return res.status(400).json({
        message: 'A data e horário da consulta são obrigatórios.'
      });
    }

    // REGRA 1: Não permitir agendamentos no passado
    if (new Date(dataFinal) < new Date()) {
      return res.status(400).json({
        message: 'Não é possível agendar consultas para datas que já passaram.'
      });
    }

    // REGRA 2: Impedir choque de horário para o mesmo veterinário
    const conflito = await Consulta.findOne({
      veterinarioId,
      $or: [
        { dataHorario: dataFinal },
        { dataConsulta: dataFinal }
      ],
      status: { $ne: 'cancelada' }
    });

    if (conflito) {
      return res.status(400).json({
        message:
          'Este veterinário já possui uma consulta agendada neste mesmo horário.'
      });
    }

    const novaConsulta = new Consulta({
      petId,
      veterinarioId,

      // Mantém os dois campos
      dataHorario: dataFinal,
      dataConsulta: dataFinal,

      // Mantém todos os campos
      observacoes,
      motivo,
      pesoAtual,

      // Se não informar status, começa como agendada
      status: status || 'agendada'
    });

    const consultaSalva = await novaConsulta.save();

    res.status(201).json(consultaSalva);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};


// 2. Listar Consultas
export const listarConsultas = async (req, res) => {
  try {
    let filtro = {};

    // REGRA 3: Filtro por papel do usuário logado
    if (req.usuarioRole === 'tutor') {
      // Busca os pets pertencentes ao tutor logado
      const meusPets = await Pet.find({
        tutorId: req.usuarioId
      }).select('_id');

      const meusPetsIds = meusPets.map(pet => pet._id);

      // Mostra apenas consultas dos pets do tutor
      filtro = {
        petId: { $in: meusPetsIds }
      };
    }

    else if (req.usuarioRole === 'veterinario') {
      // Mostra apenas consultas atribuídas ao veterinário logado
      filtro = {
        veterinarioId: req.usuarioId
      };
    }

    // Admin não possui filtro e vê todas as consultas

    const consultas = await Consulta.find(filtro)
      .populate('petId', 'nome especie raca')
      .populate('veterinarioId', 'nome email')
      .sort({
        dataHorario: 1,
        dataConsulta: 1
      });

    res.status(200).json(consultas);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// 3. Buscar Consulta por ID
export const buscarConsultaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const consulta = await Consulta.findById(id)
      .populate('petId', 'nome especie raca')
      .populate('veterinarioId', 'nome email');

    if (!consulta) {
      return res.status(404).json({
        message: 'Consulta não encontrada.'
      });
    }

    res.status(200).json(consulta);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// 4. Atualizar Consulta
export const atualizarConsulta = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      status,
      observacoes,
      motivo,
      pesoAtual,
      dataHorario,
      dataConsulta
    } = req.body;

    // Se uma das datas for enviada, usa ela
    const dataFinal = dataHorario || dataConsulta;

    // REGRA: Não permitir alterar para uma data passada
    if (dataFinal && new Date(dataFinal) < new Date()) {
      return res.status(400).json({
        message:
          'Não é possível alterar a consulta para uma data que já passou.'
      });
    }

    // Busca a consulta atual antes de atualizar
    const consultaExistente = await Consulta.findById(id);

    if (!consultaExistente) {
      return res.status(404).json({
        message: 'Consulta não encontrada.'
      });
    }

    // REGRA: Verificar conflito caso o horário seja alterado
    if (dataFinal) {
      const veterinarioFinal =
        req.body.veterinarioId || consultaExistente.veterinarioId;

      const conflito = await Consulta.findOne({
        _id: { $ne: id },
        veterinarioId: veterinarioFinal,
        $or: [
          { dataHorario: dataFinal },
          { dataConsulta: dataFinal }
        ],
        status: { $ne: 'cancelada' }
      });

      if (conflito) {
        return res.status(400).json({
          message:
            'Este veterinário já possui uma consulta agendada neste mesmo horário.'
        });
      }
    }

    // Monta somente os campos permitidos
    const dadosAtualizacao = {};

    if (status !== undefined) {
      dadosAtualizacao.status = status;
    }

    if (observacoes !== undefined) {
      dadosAtualizacao.observacoes = observacoes;
    }

    if (motivo !== undefined) {
      dadosAtualizacao.motivo = motivo;
    }

    if (pesoAtual !== undefined) {
      dadosAtualizacao.pesoAtual = pesoAtual;
    }

    if (dataHorario !== undefined) {
      dadosAtualizacao.dataHorario = dataHorario;
    }

    if (dataConsulta !== undefined) {
      dadosAtualizacao.dataConsulta = dataConsulta;
    }

    // Permite atualizar pet e veterinário
    if (req.body.petId !== undefined) {
      dadosAtualizacao.petId = req.body.petId;
    }

    if (req.body.veterinarioId !== undefined) {
      dadosAtualizacao.veterinarioId = req.body.veterinarioId;
    }

    const consultaAtualizada = await Consulta.findByIdAndUpdate(
      id,
      dadosAtualizacao,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('petId', 'nome especie raca')
      .populate('veterinarioId', 'nome email');

    res.status(200).json(consultaAtualizada);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};


// 5. Deletar Consulta
export const deletarConsulta = async (req, res) => {
  try {
    const { id } = req.params;

    const consultaDeletada = await Consulta.findByIdAndDelete(id);

    // Verifica se a consulta realmente existia
    if (!consultaDeletada) {
      return res.status(404).json({
        message: 'Consulta não encontrada.'
      });
    }

    res.status(200).json({
      message: 'Consulta deletada com sucesso.'
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
