const { pool } = require('../config/database');

class DashboardController {
  // Ottieni tutti gli utenti della palestra
  static async getUsers(req, res) {
    try {
      const [users] = await pool.execute(`
        SELECT
          u.id,
          u.nome,
          u.cognome,
          u.email,
          u.data_nascita,
          u.codice_fiscale,
          a.id as abbonamento_id,
          a.id_corso,
          a.data_inizio as abbonamento_inizio,
          a.data_fine as abbonamento_fine,
          a.durata_mesi,
          c.nome_corso,
          c.descrizione as corso_descrizione
        FROM Utenti u
        LEFT JOIN Abbonamenti a ON u.id = a.id_utente AND a.data_fine >= CURDATE()
        LEFT JOIN Corsi c ON a.id_corso = c.id
        ORDER BY u.id DESC
      `);

      // Raggruppa i risultati per utente
      const usersMap = new Map();

      users.forEach(row => {
        if (!usersMap.has(row.id)) {
          usersMap.set(row.id, {
            id: row.id,
            nome: row.nome,
            cognome: row.cognome,
            email: row.email,
            data_nascita: row.data_nascita,
            codice_fiscale: row.codice_fiscale,
            abbonamenti: []
          });
        }

        if (row.abbonamento_id) {
          usersMap.get(row.id).abbonamenti.push({
            id: row.abbonamento_id,
            id_corso: row.id_corso,
            nome_corso: row.nome_corso,
            corso_descrizione: row.corso_descrizione,
            data_inizio: row.abbonamento_inizio,
            data_fine: row.abbonamento_fine,
            durata_mesi: row.durata_mesi
          });
        }
      });

      const result = Array.from(usersMap.values());

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Errore nel recupero utenti:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }
  // Crea un nuovo utente della palestra
  static async createUser(req, res) {
    try {
      const { nome, cognome, email, data_nascita, codice_fiscale } = req.body;

      if (!nome || !cognome || !data_nascita || !codice_fiscale) {
        return res.status(400).json({
          success: false,
          message: 'Nome, cognome, data di nascita e codice fiscale sono obbligatori'
        });
      }

      // Verifica se l'email esiste già (se fornita)
      if (email) {
        const [existingUsers] = await pool.execute(
          'SELECT id FROM Utenti WHERE email = ?',
          [email]
        );

        if (existingUsers.length > 0) {
          return res.status(409).json({
            success: false,
            message: 'Un utente con questa email esiste già'
          });
        }
      }

      // Verifica se il codice fiscale esiste già
      const [existingCF] = await pool.execute(
        'SELECT id FROM Utenti WHERE codice_fiscale = ?',
        [codice_fiscale]
      );

      if (existingCF.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Un utente con questo codice fiscale esiste già'
        });
      }

      const [result] = await pool.execute(
        'INSERT INTO Utenti (nome, cognome, email, data_nascita, codice_fiscale) VALUES (?, ?, ?, ?, ?)',
        [nome, cognome, email || null, data_nascita, codice_fiscale]
      );

      // Recupera l'utente appena creato
      const [newUser] = await pool.execute(
        'SELECT * FROM Utenti WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        data: newUser[0],
        message: 'Utente creato con successo'
      });

    } catch (error) {
      console.error('Errore nella creazione utente:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }
  // Aggiorna un utente
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { nome, cognome, email, data_nascita, codice_fiscale } = req.body;

      // Verifica se l'utente esiste
      const [existingUsers] = await pool.execute(
        'SELECT id FROM Utenti WHERE id = ?',
        [id]
      );

      if (existingUsers.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Utente non trovato'
        });
      }

      // Verifica se l'email è già utilizzata da un altro utente
      if (email) {
        const [emailExists] = await pool.execute(
          'SELECT id FROM Utenti WHERE email = ? AND id != ?',
          [email, id]
        );

        if (emailExists.length > 0) {
          return res.status(409).json({
            success: false,
            message: 'Email già utilizzata da un altro utente'
          });
        }
      }

      // Verifica se il codice fiscale è già utilizzato da un altro utente
      if (codice_fiscale) {
        const [cfExists] = await pool.execute(
          'SELECT id FROM Utenti WHERE codice_fiscale = ? AND id != ?',
          [codice_fiscale, id]
        );

        if (cfExists.length > 0) {
          return res.status(409).json({
            success: false,
            message: 'Codice fiscale già utilizzato da un altro utente (questo utente esiste già)'
          });
        }
      }

      const updateFields = [];
      const updateValues = [];

      if (nome !== undefined) {
        updateFields.push('nome = ?');
        updateValues.push(nome);
      }
      if (cognome !== undefined) {
        updateFields.push('cognome = ?');
        updateValues.push(cognome);
      }
      if (email !== undefined) {
        updateFields.push('email = ?');
        updateValues.push(email);
      }
      if (data_nascita !== undefined) {
        updateFields.push('data_nascita = ?');
        updateValues.push(data_nascita);
      }
      if (codice_fiscale !== undefined) {
        updateFields.push('codice_fiscale = ?');
        updateValues.push(codice_fiscale);
      }

      updateValues.push(id);

      if (updateFields.length > 0) {
        await pool.execute(
          `UPDATE Utenti SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        );
      }

      // Recupera l'utente aggiornato
      const [updatedUser] = await pool.execute(
        'SELECT * FROM Utenti WHERE id = ?',
        [id]
      );

      res.json({
        success: true,
        data: updatedUser[0],
        message: 'Utente aggiornato con successo'
      });

    } catch (error) {
      console.error('Errore nell\'aggiornamento utente:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  // Elimina un utente
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const [result] = await pool.execute(
        'DELETE FROM Utenti WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Utente non trovato'
        });
      }

      res.json({
        success: true,
        message: 'Utente eliminato con successo'
      });

    } catch (error) {
      console.error('Errore nell\'eliminazione utente:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }
  // Ottieni tutti gli abbonamenti
  static async getSubscriptions(req, res) {
    try {
      const [subscriptions] = await pool.execute(`
        SELECT
          a.*,
          u.nome,
          u.cognome,
          u.email,
          u.codice_fiscale,
          c.nome_corso,
          c.descrizione as corso_descrizione
        FROM Abbonamenti a
        JOIN Utenti u ON a.id_utente = u.id
        JOIN Corsi c ON a.id_corso = c.id
        ORDER BY a.data_inizio DESC
      `);

      res.json({
        success: true,
        data: subscriptions
      });

    } catch (error) {
      console.error('Errore nel recupero abbonamenti:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }
  // Crea un nuovo abbonamento
  static async createSubscription(req, res) {
    try {
      const { id_utente, id_corso, data_inizio, durata_mesi } = req.body;

      if (!id_utente || !id_corso || !data_inizio || !durata_mesi) {
        return res.status(400).json({
          success: false,
          message: 'Tutti i campi sono obbligatori (id_utente, id_corso, data_inizio, durata_mesi)'
        });
      }

      // Verifica che l'utente esista
      const [userExists] = await pool.execute(
        'SELECT id FROM Utenti WHERE id = ?',
        [id_utente]
      );

      if (userExists.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Utente non trovato'
        });
      }

      // Verifica che il corso esista
      const [courseExists] = await pool.execute(
        'SELECT id FROM Corsi WHERE id = ?',
        [id_corso]
      );

      if (courseExists.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Corso non trovato'
        });
      }

      const [result] = await pool.execute(
        'INSERT INTO Abbonamenti (id_utente, id_corso, data_inizio, durata_mesi) VALUES (?, ?, ?, ?)',
        [id_utente, id_corso, data_inizio, durata_mesi]
      );

      // Recupera l'abbonamento appena creato con i dettagli
      const [newSubscription] = await pool.execute(`
        SELECT
          a.*,
          u.nome,
          u.cognome,
          u.email,
          c.nome_corso,
          c.descrizione as corso_descrizione
        FROM Abbonamenti a
        JOIN Utenti u ON a.id_utente = u.id
        JOIN Corsi c ON a.id_corso = c.id
        WHERE a.id = ?
      `, [result.insertId]);

      res.status(201).json({
        success: true,
        data: newSubscription[0],
        message: 'Abbonamento creato con successo'
      });

    } catch (error) {
      console.error('Errore nella creazione abbonamento:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }
  // Aggiorna un abbonamento
  static async updateSubscription(req, res) {
    try {
      const { id } = req.params;
      const { id_utente, id_corso, data_inizio, durata_mesi } = req.body;

      // Verifica se l'abbonamento esiste
      const [existingSubs] = await pool.execute(
        'SELECT id FROM Abbonamenti WHERE id = ?',
        [id]
      );

      if (existingSubs.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Abbonamento non trovato'
        });
      }

      const updateFields = [];
      const updateValues = [];

      if (id_utente !== undefined) {
        // Verifica che l'utente esista
        const [userExists] = await pool.execute(
          'SELECT id FROM Utenti WHERE id = ?',
          [id_utente]
        );

        if (userExists.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Utente non trovato'
          });
        }

        updateFields.push('id_utente = ?');
        updateValues.push(id_utente);
      }

      if (id_corso !== undefined) {
        // Verifica che il corso esista
        const [courseExists] = await pool.execute(
          'SELECT id FROM Corsi WHERE id = ?',
          [id_corso]
        );

        if (courseExists.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Corso non trovato'
          });
        }

        updateFields.push('id_corso = ?');
        updateValues.push(id_corso);
      }

      if (data_inizio !== undefined) {
        updateFields.push('data_inizio = ?');
        updateValues.push(data_inizio);
      }

      if (durata_mesi !== undefined) {
        updateFields.push('durata_mesi = ?');
        updateValues.push(durata_mesi);
      }

      updateValues.push(id);

      if (updateFields.length > 0) {
        await pool.execute(
          `UPDATE Abbonamenti SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        );
      }

      // Recupera l'abbonamento aggiornato
      const [updatedSubscription] = await pool.execute(`
        SELECT
          a.*,
          u.nome,
          u.cognome,
          u.email,
          c.nome_corso,
          c.descrizione as corso_descrizione
        FROM Abbonamenti a
        JOIN Utenti u ON a.id_utente = u.id
        JOIN Corsi c ON a.id_corso = c.id
        WHERE a.id = ?
      `, [id]);

      res.json({
        success: true,
        data: updatedSubscription[0],
        message: 'Abbonamento aggiornato con successo'
      });

    } catch (error) {
      console.error('Errore nell\'aggiornamento abbonamento:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  // Elimina un abbonamento
  static async deleteSubscription(req, res) {
    try {
      const { id } = req.params;

      const [result] = await pool.execute(
        'DELETE FROM Abbonamenti WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Abbonamento non trovato'
        });
      }

      res.json({
        success: true,
        message: 'Abbonamento eliminato con successo'
      });

    } catch (error) {
      console.error('Errore nell\'eliminazione abbonamento:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  // Ottieni tutti gli accessi
  static async getAccesses(req, res) {
    try {
      const [accesses] = await pool.execute(`
        SELECT
          i.*,
          u.nome,
          u.cognome,
          u.email,
          CONCAT(u.nome, ' ', u.cognome) as nome_utente
        FROM Ingressi i
        JOIN Utenti u ON i.id_utente = u.id
        ORDER BY i.data_ora DESC
        LIMIT 100
      `);

      res.json({
        success: true,
        data: accesses
      });

    } catch (error) {
      console.error('Errore nel recupero accessi:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }  // Registra un nuovo accesso
  static async createAccess(req, res) {
    try {
      const { id_utente, data_ora } = req.body;

      // Validazione input
      if (!id_utente) {
        return res.status(400).json({
          success: false,
          message: 'ID utente è richiesto'
        });
      }

      // Verifica che l'utente esista
      const [userExists] = await pool.execute(
        'SELECT id FROM Utenti WHERE id = ?',
        [id_utente]
      );

      if (userExists.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Utente non trovato'
        });
      }      // Usa sempre l'orario JavaScript (attuale o fornito dal frontend)
      const timestampAccesso = data_ora ? new Date(data_ora) : new Date();

      // Validazione della data se fornita
      if (data_ora && isNaN(timestampAccesso.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Formato data/ora non valido'
        });
      }

      // Formatta la data per MySQL mantenendo il fuso orario locale
      // Utilizziamo toLocaleString per ottenere l'orario nel fuso orario italiano
      const italianTime = timestampAccesso.toLocaleString('it-IT', {
        timeZone: 'Europe/Rome'
      });
      console.log('Orario locale italiano:', italianTime);
      const date = new Date();
      console.log('Data e ora corrente:', date);
      const [result] = await pool.execute(
        'INSERT INTO Ingressi (id_utente, data_ora) VALUES (?, ADDTIME(?, "02:00:00"))',
        [id_utente, date]
      );      // Recupera l'accesso appena creato con i dati dell'utente
      const [newAccess] = await pool.execute(`
        SELECT
          i.id,
          i.id_utente,
          i.data_ora,
          u.nome,
          u.cognome,
          u.email
        FROM Ingressi i
        JOIN Utenti u ON i.id_utente = u.id
        WHERE i.id = ?
      `, [result.insertId]);

      res.json({
        success: true,
        message: 'Accesso registrato con successo',
        data: newAccess[0]
      });

    } catch (error) {
      console.error('Errore nella creazione accesso:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }  // Funzione per aggiornare un accesso esistente
  static async updateAccess(req, res) {
    try {
      const { id } = req.params;
      const { id_utente, data_ora } = req.body;

      // Validazione input
      if (!id_utente || !data_ora) {
        return res.status(400).json({
          success: false,
          message: 'ID utente e data/ora sono richiesti'
        });
      }

      // Validazione della data con orario JavaScript
      const timestampAccesso = new Date(data_ora);
      if (isNaN(timestampAccesso.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Formato data/ora non valido'
        });
      }

      // Verifica che l'accesso esista
      const [accessExists] = await pool.execute(
        'SELECT id FROM Ingressi WHERE id = ?',
        [id]
      );

      if (accessExists.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Accesso non trovato'
        });
      }

      // Verifica che l'utente esista
      const [userExists] = await pool.execute(
        'SELECT id FROM Utenti WHERE id = ?',
        [id_utente]
      );

      if (userExists.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Utente non trovato'
        });
      }

      // Formatta la data per MySQL usando l'orario JavaScript
      const mysqlTimestamp = timestampAccesso.toISOString().slice(0, 19).replace('T', ' ');

      // Aggiornamento dell'accesso con timestamp JavaScript
      await pool.execute(
        'UPDATE Ingressi SET id_utente = ?, data_ora = ? WHERE id = ?',
        [id_utente, mysqlTimestamp, id]
      );

      // Recupera l'accesso aggiornato
      const [updatedAccess] = await pool.execute(`
        SELECT
          i.id,
          i.id_utente,
          i.data_ora,
          u.nome,
          u.cognome,
          u.email
        FROM Ingressi i
        JOIN Utenti u ON i.id_utente = u.id
        WHERE i.id = ?
      `, [id]);

      res.json({
        success: true,
        message: 'Accesso aggiornato con successo',
        data: updatedAccess[0]
      });

    } catch (error) {
      console.error('Errore nell\'aggiornamento accesso:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  // Ottieni statistiche dashboard
  static async getStats(req, res) {
    try {
      // Totale utenti
      const [totalUsers] = await pool.execute('SELECT COUNT(*) as count FROM Utenti');

      // Abbonamenti attivi (non scaduti)
      const [activeSubscriptions] = await pool.execute(
        'SELECT COUNT(*) as count FROM Abbonamenti WHERE data_fine >= CURDATE()'
      );

      // Accessi oggi
      const [todayAccesses] = await pool.execute(
        'SELECT COUNT(*) as count FROM Ingressi WHERE DATE(data_ora) = CURDATE()'
      );

      // Accessi questa settimana
      const [weekAccesses] = await pool.execute(`
        SELECT COUNT(*) as count FROM Ingressi
        WHERE data_ora >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
      `);

      // Ultimi accessi (top 5 utenti con accessi recenti)
      const [recentAccesses] = await pool.execute(`
        SELECT
          u.nome,
          u.cognome,
          MAX(i.data_ora) as ultimo_accesso,
          COUNT(i.id) as totale_accessi_oggi
        FROM Utenti u
        LEFT JOIN Ingressi i ON u.id = i.id_utente AND DATE(i.data_ora) = CURDATE()
        WHERE i.id IS NOT NULL
        GROUP BY u.id, u.nome, u.cognome
        ORDER BY ultimo_accesso DESC
        LIMIT 5
      `);

      const stats = {
        totale_utenti: totalUsers[0].count,
        abbonamenti_attivi: activeSubscriptions[0].count,
        accessi_oggi: todayAccesses[0].count,
        accessi_settimana: weekAccesses[0].count,
        ultimi_accessi: recentAccesses
      };

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Errore nel recupero statistiche:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  // Ottieni tutti i corsi
  static async getCorsi(req, res) {
    try {
      const [corsi] = await pool.execute(`
        SELECT
          c.*,
          COUNT(a.id) as abbonamenti_attivi
        FROM Corsi c
        LEFT JOIN Abbonamenti a ON c.id = a.id_corso AND a.data_fine >= CURDATE()
        GROUP BY c.id, c.nome_corso, c.descrizione, c.durata_mesi_default
        ORDER BY c.nome_corso
      `);

      res.json({
        success: true,
        data: corsi
      });

    } catch (error) {
      console.error('Errore nel recupero corsi:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  // Crea un nuovo corso
  static async createCorso(req, res) {
    try {
      const { nome_corso, descrizione, durata_mesi_default } = req.body;

      if (!nome_corso) {
        return res.status(400).json({
          success: false,
          message: 'Nome corso è obbligatorio'
        });
      }

      // Verifica se esiste già un corso con lo stesso nome e durata
      const [existingCourse] = await pool.execute(
        'SELECT id FROM Corsi WHERE nome_corso = ? AND durata_mesi_default = ?',
        [nome_corso, durata_mesi_default || null]
      );

      if (existingCourse.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Esiste già un corso con questo nome e durata'
        });
      }

      const [result] = await pool.execute(
        'INSERT INTO Corsi (nome_corso, descrizione, durata_mesi_default) VALUES (?, ?, ?)',
        [nome_corso, descrizione || null, durata_mesi_default || null]
      );

      // Recupera il corso appena creato
      const [newCourse] = await pool.execute(
        'SELECT * FROM Corsi WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        data: newCourse[0],
        message: 'Corso creato con successo'
      });

    } catch (error) {
      console.error('Errore nella creazione corso:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }
}

module.exports = DashboardController;
