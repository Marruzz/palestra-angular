const bcrypt = require('bcrypt');
const { pool } = require('../config/database');

class AuthController {

  // Login dell'utente (senza JWT)
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validazione input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email e password sono obbligatori'
        });
      }

      // Cerca l'utente nel database
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

      // Verifica la password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Credenziali non valide'
        });
      }

      // Risposta di successo (senza token JWT)
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
      console.error('Errore durante il login:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  // Registrazione di un nuovo utente (opzionale)
  static async register(req, res) {
    try {
      const { email, password, nome } = req.body;

      // Validazione input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email e password sono obbligatori'
        });
      }

      // Verifica se l'utente esiste già
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

      // Hash della password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Inserisci il nuovo utente
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
      console.error('Errore durante la registrazione:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  // Middleware vuoto - non fa più controlli di autenticazione
  static async verifyToken(req, res, next) {
    // Passa sempre al prossimo middleware senza verifiche
    next();
  }
}

module.exports = AuthController;
