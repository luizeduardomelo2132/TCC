import Usuario from '../models/Usuario.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'chave_super_secreta_tcc_2026';

export const registrar = async (req, res) => {
  try {
    const { nome, email, senha, role } = req.body;

    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ message: 'E-mail já cadastrado.' });
    }

    const novoUsuario = new Usuario({ nome, email, senha, role });
    await novoUsuario.save();

    res.status(201).json({ message: 'Usuário registrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ message: 'Senha incorreta.' });
    }

    const token = jwt.sign(
      { id: usuario._id, role: usuario.role },
      SECRET_KEY,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login realizado com sucesso',
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        senhaTemporaria: usuario.senhaTemporaria,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};