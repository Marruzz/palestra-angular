const bcrypt = require('bcrypt');
const { pool } = require('../config/database');

class AuthController {


  static async login(req, res) {
    try {
      const { email, password } = req.body;


      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email e password sono obbligatori'
        });
      }


      const [users] = await pool.execute(
        'SELECT id, email, password, nome FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Credenziali non valide'
        });
      }

      const user = users[0];


      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Credenziali non valide'
        });
      }


      res.json({
        success: true,
        message: 'Login effettuato con successo',
        user: {
          id: user.id,
          email: user.email,
          nome: user.nome
        }
      });

    } catch (error) {
      console.error('UAUAUAUAUAAU ERRORE DI LOGIN', error);
      res.status(500).json({
        success: false,
        message: 'POLIZIA MUNICIPALE, ERRORE INTERNO DEL SERVER'
      });
    }
  }


  static async register(req, res) {
    try {
      const { email, password, nome } = req.body;


      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email e password sono obbligatori'
        });
      }


      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Utente già esistente con questa email'
        });
      }


      const hashedPassword = await bcrypt.hash(password, 10);


      const [result] = await pool.execute(
        'INSERT INTO users (email, password, nome) VALUES (?, ?, ?)',
        [email, hashedPassword, nome || null]
      );

      res.status(201).json({
        success: true,
        message: 'Utente registrato con successo',
        user: {
          id: result.insertId,
          email: email,
          nome: nome
        }
      });

    } catch (error) {
      console.error('DOTTORE ABBIAMO UN PROBLEMA', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }


  static async verifyToken(req, res, next) {

    next();
  }
}

module.exports = AuthController;
