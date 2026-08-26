import Consulta from '../models/Consulta.js';
import Pet from '../models/Pet.js';
import Usuario from '../models/Usuario.js';

// ==========================================
// 1. CRIAR CONSULTA
// ==========================================

export const criarConsulta = async (req, res) => {
  try {
    const {
      petId,
      veterinarioId,
      dataConsulta,
      observacoes,
      motivo,
      pesoAtual
    } = req.body;

    if (!petId) {
      return res.status(400).json({
        message: 'O pet é obrigatório.'
      });
    }

    if (!veterinarioId) {
      return res.status(400).json({
        message: 'O veterinário é obrigatório.'
      });
    }

    if (!motivo) {
      return res.status(400).json({
        message: 'O motivo da consulta é obrigatório.'
      });
    }

    if (!dataConsulta) {
      return res.status(400).json({
        message: 'A data e horário da consulta são obrigatórios.'
      });
    }

    // ==========================================
    // VERIFICAR PET
    // ==========================================

    const pet = await Pet.findById(petId);

    if (!pet) {
      return res.status(404).json({
        message: 'Pet não encontrado.'
      });
    }

    // ==========================================
    // SEGURANÇA DO TUTOR
    // ==========================================

    if (req.usuarioRole === 'tutor') {
      const tutorDoPet =
        pet.tutorId?.toString() === req.usuarioId.toString() ||
        pet.tutor?.toString() === req.usuarioId.toString();

      if (!tutorDoPet) {
        return res.status(403).json({
          message: 'Você só pode agendar consultas para seus próprios pets.'
        });
      }
    }

    // ==========================================
    // VERIFICAR VETERINÁRIO
    // ==========================================

    const veterinario = await Usuario.findOne({
      _id: veterinarioId,
      role: 'veterinario'
    });

    if (!veterinario) {
      return res.status(400).json({
        message: 'Veterinário não encontrado.'
      });
    }

    // ==========================================
    // VERIFICAR DATA
    // ==========================================

    const novaData = new Date(dataConsulta);

    if (isNaN(novaData.getTime())) {
      return res.status(400).json({
        message: 'Data da consulta inválida.'
      });
    }

    if (novaData < new Date()) {
      return res.status(400).json({
        message: 'Não é possível agendar consultas para datas que já passaram.'
      });
    }

    // ==========================================
    // VERIFICAR CONFLITO DE HORÁRIO
    // Consideramos cada consulta com duração de 30 minutos.
    // ==========================================

    const consultasExistentes = await Consulta.find({
      veterinarioId,
      status: { $ne: 'cancelada' }
    }).select('dataConsulta');

    const conflito = consultasExistentes.some((consulta) => {
      if (!consulta.dataConsulta) {
        return false;
      }

      const dataExistente = new Date(consulta.dataConsulta);

      const diferenca = Math.abs(
        novaData.getTime() - dataExistente.getTime()
      );

      return diferenca < 30 * 60 * 1000;
    });

    if (conflito) {
      return res.status(400).json({
        message:
          'Este veterinário já possui uma consulta agendada neste horário.'
      });
    }

    // ==========================================
    // STATUS
    // Tutor nunca pode escolher um status diferente
    // de "agendada" ao criar.
    // ==========================================

    const statusInicial = 'agendada';

    // ==========================================
    // CRIAR CONSULTA
    // ==========================================

    const novaConsulta = new Consulta({
      petId,
      veterinarioId,
      dataConsulta: novaData,
      observacoes,
      motivo,
      pesoAtual,
      status: statusInicial
    });

    const consultaSalva = await novaConsulta.save();

    // ==========================================
    // RETORNAR CONSULTA COMPLETA
    // ==========================================

    const consultaFormatada = await Consulta.findById(consultaSalva._id)
      .populate('petId', 'nome especie raca idade peso tutorId')
      .populate('veterinarioId', 'nome email especialidade');

    return res.status(201).json(consultaFormatada);

  } catch (error) {
    console.error('Erro ao criar consulta:', error);

    return res.status(400).json({
      message: error.message
    });
  }
};


// ==========================================
// 2. LISTAR CONSULTAS
// ==========================================

export const listarConsultas = async (req, res) => {
  try {
    let filtro = {};

    // ==========================================
    // TUTOR
    // ==========================================

    if (req.usuarioRole === 'tutor') {

      const meusPets = await Pet.find({
        $or: [
          { tutorId: req.usuarioId },
          { tutor: req.usuarioId }
        ]
      }).select('_id');

      const meusPetsIds = meusPets.map((pet) => pet._id);

      filtro = {
        petId: {
          $in: meusPetsIds
        }
      };
    }

    // ==========================================
    // VETERINÁRIO
    // ==========================================

    else if (req.usuarioRole === 'veterinario') {

      filtro = {
        veterinarioId: req.usuarioId
      };
    }

    // ==========================================
    // ADMIN
    // ==========================================

    // Admin não recebe filtro e vê todas.

    const consultas = await Consulta.find(filtro)
      .populate(
        'petId',
        'nome especie raca idade peso tutorId'
      )
      .populate(
        'veterinarioId',
        'nome email especialidade'
      )
      .sort({
        dataConsulta: 1
      });

    return res.status(200).json(consultas);

  } catch (error) {

    console.error(
      'Erro interno em listarConsultas:',
      error
    );

    return res.status(500).json({
      message: error.message
    });
  }
};


// ==========================================
// 3. BUSCAR CONSULTA POR ID
// ==========================================

export const buscarConsultaPorId = async (req, res) => {
  try {

    const { id } = req.params;

    const consulta = await Consulta.findById(id)
      .populate(
        'petId',
        'nome especie raca idade peso tutorId'
      )
      .populate(
        'veterinarioId',
        'nome email especialidade'
      );

    if (!consulta) {
      return res.status(404).json({
        message: 'Consulta não encontrada.'
      });
    }

    // ==========================================
    // SEGURANÇA DO TUTOR
    // ==========================================

    if (req.usuarioRole === 'tutor') {

      const pet = await Pet.findOne({
        _id: consulta.petId._id,
        $or: [
          { tutorId: req.usuarioId },
          { tutor: req.usuarioId }
        ]
      });

      if (!pet) {
        return res.status(403).json({
          message:
            'Você não tem permissão para visualizar esta consulta.'
        });
      }
    }

    // ==========================================
    // SEGURANÇA DO VETERINÁRIO
    // ==========================================

    if (req.usuarioRole === 'veterinario') {

      if (
        consulta.veterinarioId._id.toString() !==
        req.usuarioId.toString()
      ) {
        return res.status(403).json({
          message:
            'Você não tem permissão para visualizar esta consulta.'
        });
      }
    }

    return res.status(200).json(consulta);

  } catch (error) {

    console.error(
      'Erro ao buscar consulta:',
      error
    );

    return res.status(500).json({
      message: error.message
    });
  }
};


// ==========================================
// 4. ATUALIZAR CONSULTA
// ==========================================

export const atualizarConsulta = async (req, res) => {
  try {

    const { id } = req.params;

    const consultaExistente =
      await Consulta.findById(id);

    if (!consultaExistente) {
      return res.status(404).json({
        message: 'Consulta não encontrada.'
      });
    }

    // ==========================================
    // TUTOR
    // ==========================================

    if (req.usuarioRole === 'tutor') {

      const petDoTutor = await Pet.findOne({
        _id: consultaExistente.petId,
        $or: [
          { tutorId: req.usuarioId },
          { tutor: req.usuarioId }
        ]
      });

      if (!petDoTutor) {
        return res.status(403).json({
          message:
            'Você não tem permissão para alterar esta consulta.'
        });
      }

      // Tutor só pode cancelar.
      if (
        req.body.status &&
        req.body.status !== 'cancelada'
      ) {
        return res.status(403).json({
          message:
            'O tutor não pode alterar o status desta consulta.'
        });
      }

      // Tutor não pode alterar pet ou veterinário.
      if (
        req.body.petId !== undefined ||
        req.body.veterinarioId !== undefined
      ) {
        return res.status(403).json({
          message:
            'Você não pode alterar o pet ou veterinário da consulta.'
        });
      }

      // Tutor também não pode alterar outros dados.
      const camposProibidos = [
        'motivo',
        'pesoAtual',
        'dataConsulta',
        'dataHorario',
        'observacoes'
      ];

      const tentouAlterarCampo =
        camposProibidos.some(
          (campo) =>
            req.body[campo] !== undefined
        );

      if (tentouAlterarCampo) {
        return res.status(403).json({
          message:
            'O tutor não pode editar os dados da consulta. Apenas cancelar.'
        });
      }
    }

    // ==========================================
    // VETERINÁRIO
    // ==========================================

    if (req.usuarioRole === 'veterinario') {

      if (
        consultaExistente.veterinarioId.toString() !==
        req.usuarioId.toString()
      ) {
        return res.status(403).json({
          message:
            'Você não pode alterar esta consulta.'
        });
      }
    }

    // ==========================================
    // DADOS PERMITIDOS
    // ==========================================

    const {
      status,
      observacoes,
      motivo,
      pesoAtual,
      dataConsulta
    } = req.body;

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

    // ==========================================
    // ALTERAR DATA
    // ==========================================

    if (dataConsulta !== undefined) {

      const novaData =
        new Date(dataConsulta);

      if (isNaN(novaData.getTime())) {
        return res.status(400).json({
          message: 'Data da consulta inválida.'
        });
      }

      if (novaData < new Date()) {
        return res.status(400).json({
          message:
            'Não é possível alterar a consulta para uma data que já passou.'
        });
      }

      // Verificar conflito
      const consultasExistentes =
        await Consulta.find({
          _id: { $ne: id },
          veterinarioId:
            consultaExistente.veterinarioId,
          status: { $ne: 'cancelada' }
        }).select('dataConsulta');

      const conflito =
        consultasExistentes.some((consulta) => {

          if (!consulta.dataConsulta) {
            return false;
          }

          const dataExistente =
            new Date(consulta.dataConsulta);

          const diferenca =
            Math.abs(
              novaData.getTime() -
              dataExistente.getTime()
            );

          return diferenca <
            30 * 60 * 1000;
        });

      if (conflito) {
        return res.status(400).json({
          message:
            'Este veterinário já possui uma consulta agendada neste horário.'
        });
      }

      dadosAtualizacao.dataConsulta =
        novaData;
    }

    // ==========================================
    // ADMIN / VETERINÁRIO
    // ==========================================

    if (
      req.usuarioRole === 'admin' ||
      req.usuarioRole === 'veterinario'
    ) {

      if (req.body.petId !== undefined) {
        dadosAtualizacao.petId =
          req.body.petId;
      }

      if (
        req.body.veterinarioId !== undefined
      ) {

        const veterinario =
          await Usuario.findOne({
            _id: req.body.veterinarioId,
            role: 'veterinario'
          });

        if (!veterinario) {
          return res.status(400).json({
            message:
              'Veterinário não encontrado.'
          });
        }

        dadosAtualizacao.veterinarioId =
          req.body.veterinarioId;
      }
    }

    const consultaAtualizada =
      await Consulta.findByIdAndUpdate(
        id,
        dadosAtualizacao,
        {
          new: true,
          runValidators: true
        }
      )
        .populate(
          'petId',
          'nome especie raca idade peso tutorId'
        )
        .populate(
          'veterinarioId',
          'nome email especialidade'
        );

    return res.status(200).json(
      consultaAtualizada
    );

  } catch (error) {

    console.error(
      'Erro ao atualizar consulta:',
      error
    );

    return res.status(400).json({
      message: error.message
    });
  }
};


// ==========================================
// 5. DELETAR / CANCELAR CONSULTA
// ==========================================

export const deletarConsulta = async (req, res) => {
  try {

    const { id } = req.params;

    const consulta =
      await Consulta.findById(id);

    if (!consulta) {
      return res.status(404).json({
        message: 'Consulta não encontrada.'
      });
    }

    // ==========================================
    // TUTOR
    // ==========================================

    if (req.usuarioRole === 'tutor') {

      const petDoTutor =
        await Pet.findOne({
          _id: consulta.petId,
          $or: [
            { tutorId: req.usuarioId },
            { tutor: req.usuarioId }
          ]
        });

      if (!petDoTutor) {
        return res.status(403).json({
          message:
            'Você não tem permissão para cancelar esta consulta.'
        });
      }

      // Não apaga do banco.
      consulta.status =
        'cancelada';

      await consulta.save();

      return res.status(200).json({
        message:
          'Consulta cancelada com sucesso.',
        consulta
      });
    }

    // ==========================================
    // ADMIN / VETERINÁRIO
    // ==========================================

    if (req.usuarioRole === 'veterinario') {

      if (
        consulta.veterinarioId.toString() !==
        req.usuarioId.toString()
      ) {
        return res.status(403).json({
          message:
            'Você não pode excluir esta consulta.'
        });
      }
    }

    await Consulta.findByIdAndDelete(id);

    return res.status(200).json({
      message:
        'Consulta deletada com sucesso.'
    });

  } catch (error) {

    console.error(
      'Erro ao deletar consulta:',
      error
    );

    return res.status(500).json({
      message: error.message
    });
  }
};