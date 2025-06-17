const { pool } = require('../config/database');

class DashboardController {

  static async getUsers(req, res) {
    try {      const [users] = await pool.execute(`
        SELECT
          u.id,
          u.nome,
          u.cognome,
          u.email,
          u.data_nascita,
          u.codice_fiscale,
          a.id as abbonamento_id,
          a.id_corso,
          DATE_FORMAT(a.data_inizio, '%Y-%m-%d') as abbonamento_inizio,
          DATE_FORMAT(a.data_fine, '%Y-%m-%d') as abbonamento_fine,
          a.durata_mesi,
          c.nome_corso,
          c.descrizione as corso_descrizione
        FROM Utenti u
        LEFT JOIN Abbonamenti a ON u.id = a.id_utente
        LEFT JOIN Corsi c ON a.id_corso = c.id
        ORDER BY u.id DESC
      `);


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

  static async createUser(req, res) {
    try {
      const { nome, cognome, email, data_nascita, codice_fiscale } = req.body;

      if (!nome || !cognome || !data_nascita || !codice_fiscale) {
        return res.status(400).json({
          success: false,
          message: 'Nome, cognome, data di nascita e codice fiscale sono obbligatori'
        });
      }


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

  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { nome, cognome, email, data_nascita, codice_fiscale } = req.body;


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

  static async getSubscriptions(req, res) {
    try {      const [subscriptions] = await pool.execute(`
        SELECT
          a.id,
          a.id_utente,
          a.id_corso,
          DATE_FORMAT(a.data_inizio, '%Y-%m-%d') as data_inizio,
          a.durata_mesi,
          DATE_FORMAT(a.data_fine, '%Y-%m-%d') as data_fine,
          u.nome,
          u.cognome,
          u.email,
          u.codice_fiscale,
          c.nome_corso,
          c.descrizione as corso_descrizione
        FROM Abbonamenti a
        JOIN Utenti u ON a.id_utente = u.id
        LEFT JOIN Corsi c ON a.id_corso = c.id
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

  static async createSubscription(req, res) {
    try {
      const { id_utente, id_corso, data_inizio, durata_mesi } = req.body;

      if (!id_utente || !id_corso || !data_inizio || !durata_mesi) {
        return res.status(400).json({
          success: false,
          message: 'Tutti i campi sono obbligatori (id_utente, id_corso, data_inizio, durata_mesi)'
        });
      }


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
      const [newSubscription] = await pool.execute(`
        SELECT
          a.id,
          a.id_utente,
          a.id_corso,
          DATE_FORMAT(a.data_inizio, '%Y-%m-%d') as data_inizio,
          a.durata_mesi,
          DATE_FORMAT(a.data_fine, '%Y-%m-%d') as data_fine,
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

  static async updateSubscription(req, res) {
    try {
      const { id } = req.params;
      const { id_utente, id_corso, data_inizio, durata_mesi } = req.body;


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
      const [updatedSubscription] = await pool.execute(`
        SELECT
          a.id,
          a.id_utente,
          a.id_corso,
          DATE_FORMAT(a.data_inizio, '%Y-%m-%d') as data_inizio,
          a.durata_mesi,
          DATE_FORMAT(a.data_fine, '%Y-%m-%d') as data_fine,
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
  static async getAccesses(req, res) {
    try {
      const [accesses] = await pool.execute(`
        SELECT
          i.id,
          i.id_utente,
          i.data_ora,
          u.nome,
          u.cognome,
          u.email,
          CONCAT(u.nome, ' ', u.cognome) as nome_utente
        FROM Ingressi i
        JOIN Utenti u ON i.id_utente = u.id
        ORDER BY i.data_ora DESC
        LIMIT 200
      `);


      const formattedAccesses = accesses.map(access => ({
        ...access,
        data_ora: access.data_ora instanceof Date
          ? access.data_ora.toISOString()
          : new Date(access.data_ora).toISOString()
      }));

      res.json({
        success: true,
        data: formattedAccesses
      });

    } catch (error) {
      console.error('Errore nel recupero accessi:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }
  static async createAccess(req, res) {
    try {
      const { id_utente, data_ora } = req.body;


      if (!id_utente) {
        return res.status(400).json({
          success: false,
          message: 'ID utente è richiesto'
        });
      }


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


      let timestampAccesso;
      if (data_ora) {
        timestampAccesso = new Date(data_ora);

        if (isNaN(timestampAccesso.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Formato data/ora non valido'
          });
        }
      } else {
        timestampAccesso = new Date();
      }


      const mysqlTimestamp = timestampAccesso.toISOString().slice(0, 19).replace('T', ' ');

      console.log('Registrando accesso:', {
        id_utente,
        timestamp_originale: data_ora,
        timestamp_processato: timestampAccesso.toISOString(),
        mysql_format: mysqlTimestamp
      });


      const [result] = await pool.execute(
        'INSERT INTO Ingressi (id_utente, data_ora) VALUES (?, ?)',
        [id_utente, mysqlTimestamp]
      );


      const [newAccess] = await pool.execute(`
        SELECT
          i.id,
          i.id_utente,
          i.data_ora,
          u.nome,
          u.cognome,
          u.email,
          CONCAT(u.nome, ' ', u.cognome) as nome_utente
        FROM Ingressi i
        JOIN Utenti u ON i.id_utente = u.id
        WHERE i.id = ?
      `, [result.insertId]);


      const accessData = {
        ...newAccess[0],
        data_ora: newAccess[0].data_ora instanceof Date
          ? newAccess[0].data_ora.toISOString()
          : new Date(newAccess[0].data_ora).toISOString()
      };

      res.json({
        success: true,
        message: 'Accesso registrato con successo',
        data: accessData
      });

    } catch (error) {
      console.error('Errore nella creazione accesso:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }
  static async updateAccess(req, res) {
    try {
      const { id } = req.params;
      const { id_utente, data_ora } = req.body;


      if (!id_utente || !data_ora) {
        return res.status(400).json({
          success: false,
          message: 'ID utente e data/ora sono richiesti'
        });
      }


      const timestampAccesso = new Date(data_ora);
      if (isNaN(timestampAccesso.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Formato data/ora non valido'
        });
      }


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


      const mysqlTimestamp = timestampAccesso.toISOString().slice(0, 19).replace('T', ' ');


      await pool.execute(
        'UPDATE Ingressi SET id_utente = ?, data_ora = ? WHERE id = ?',
        [id_utente, mysqlTimestamp, id]
      );


      const [updatedAccess] = await pool.execute(`
        SELECT
          i.id,
          i.id_utente,
          i.data_ora,
          u.nome,
          u.cognome,
          u.email,
          CONCAT(u.nome, ' ', u.cognome) as nome_utente
        FROM Ingressi i
        JOIN Utenti u ON i.id_utente = u.id
        WHERE i.id = ?
      `, [id]);


      const accessData = {
        ...updatedAccess[0],
        data_ora: updatedAccess[0].data_ora instanceof Date
          ? updatedAccess[0].data_ora.toISOString()
          : new Date(updatedAccess[0].data_ora).toISOString()
      };

      res.json({
        success: true,
        message: 'Accesso aggiornato con successo',
        data: accessData
      });

    } catch (error) {
      console.error('Errore nell\'aggiornamento accesso:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }  }


  static async getStats(req, res) {
    try {

      const [totalUsers] = await pool.execute('SELECT COUNT(*) as count FROM Utenti');


      const [uniqueUsersToday] = await pool.execute(`
        SELECT COUNT(DISTINCT id_utente) as count FROM Ingressi
        WHERE DATE(CONVERT_TZ(data_ora, '+00:00', '+01:00')) = CURDATE()
      `);


      const [activeSubscriptions] = await pool.execute(
        'SELECT COUNT(*) as count FROM Abbonamenti WHERE data_fine >= CURDATE()'
      );


      const [todayAccesses] = await pool.execute(`
        SELECT COUNT(*) as count FROM Ingressi
        WHERE DATE(CONVERT_TZ(data_ora, '+00:00', '+01:00')) = CURDATE()
      `);


      const [weekAccesses] = await pool.execute(`
        SELECT COUNT(*) as count FROM Ingressi
        WHERE DATE(CONVERT_TZ(data_ora, '+00:00', '+01:00')) >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
      `);


      const [monthAccesses] = await pool.execute(`
        SELECT COUNT(*) as count FROM Ingressi
        WHERE YEAR(CONVERT_TZ(data_ora, '+00:00', '+01:00')) = YEAR(CURDATE())
        AND MONTH(CONVERT_TZ(data_ora, '+00:00', '+01:00')) = MONTH(CURDATE())
      `);


      const [accessesThisYear] = await pool.execute(`
        SELECT COUNT(*) as count FROM Ingressi
        WHERE YEAR(CONVERT_TZ(data_ora, '+00:00', '+01:00')) = YEAR(CURDATE())
      `);


      const [totalAccesses] = await pool.execute('SELECT COUNT(*) as count FROM Ingressi');


      const [activeCourses] = await pool.execute('SELECT COUNT(*) as count FROM Corsi');


      const [totalSubscriptions] = await pool.execute('SELECT COUNT(*) as count FROM Abbonamenti');


      const [avgAge] = await pool.execute(`
        SELECT AVG(YEAR(CURDATE()) - YEAR(data_nascita)) as avg_age FROM Utenti
        WHERE data_nascita IS NOT NULL
      `);


      const [mostPopularCourse] = await pool.execute(`
        SELECT c.nome_corso, COUNT(a.id) as freq
        FROM Abbonamenti a
        JOIN Corsi c ON a.id_corso = c.id
        WHERE a.data_fine >= CURDATE()
        GROUP BY c.id, c.nome_corso
        ORDER BY freq DESC
        LIMIT 1
      `);


      const [leastPopularCourse] = await pool.execute(`
        SELECT c.nome_corso, COUNT(a.id) as freq
        FROM Corsi c
        LEFT JOIN Abbonamenti a ON c.id = a.id_corso AND a.data_fine >= CURDATE()
        GROUP BY c.id, c.nome_corso
        ORDER BY freq ASC
        LIMIT 1
      `);


      const [avgEntryTime] = await pool.execute(`
        SELECT TIME_FORMAT(SEC_TO_TIME(AVG(TIME_TO_SEC(TIME(CONVERT_TZ(data_ora, '+00:00', '+01:00'))))), '%H:%i') as avg_time
        FROM Ingressi
        WHERE DATE(CONVERT_TZ(data_ora, '+00:00', '+01:00')) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      `);


      const [avgCourseDuration] = await pool.execute(`
        SELECT AVG(durata_mesi) as avg_duration FROM Abbonamenti
      `);


      const [recentAccesses] = await pool.execute(`
        SELECT
          u.nome,
          u.cognome,
          MAX(i.data_ora) as ultimo_accesso,
          COUNT(CASE WHEN DATE(CONVERT_TZ(i.data_ora, '+00:00', '+01:00')) = CURDATE() THEN 1 END) as totale_accessi_oggi
        FROM Utenti u
        LEFT JOIN Ingressi i ON u.id = i.id_utente
        WHERE i.id IS NOT NULL
        GROUP BY u.id, u.nome, u.cognome
        ORDER BY ultimo_accesso DESC
        LIMIT 5
      `);

      const stats = {
        totale_utenti: totalUsers[0].count,
        utenti_entrati_oggi: uniqueUsersToday[0].count,
        abbonamenti_attivi: activeSubscriptions[0].count,
        accessi_oggi: todayAccesses[0].count,
        accessi_settimana: weekAccesses[0].count,
        accessi_mese: monthAccesses[0].count,
        accessi_anno: accessesThisYear[0].count,
        accessi_sempre: totalAccesses[0].count,
        corsi_attivi: activeCourses[0].count,
        totale_abbonamenti: totalSubscriptions[0].count,
        eta_media_utenti: avgAge[0].avg_age ? Math.round(avgAge[0].avg_age) : 0,
        corso_piu_frequentato: mostPopularCourse.length > 0 ? mostPopularCourse[0].nome_corso : 'Nessuno',
        corso_meno_frequentato: leastPopularCourse.length > 0 ? leastPopularCourse[0].nome_corso : 'Nessuno',
        tempo_medio_entrata: avgEntryTime[0].avg_time || '00:00',
        durata_media_corso: avgCourseDuration[0].avg_duration ? Math.round(avgCourseDuration[0].avg_duration) : 0,
        ultimi_accessi: recentAccesses.map(access => ({
          ...access,
          ultimo_accesso: access.ultimo_accesso instanceof Date
            ? access.ultimo_accesso.toISOString()
            : new Date(access.ultimo_accesso).toISOString()
        }))
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




  static async getUsersSimple(req, res) {
    try {
      const [users] = await pool.execute(`
        SELECT id, nome, cognome, email, data_nascita, codice_fiscale
        FROM Utenti
        ORDER BY id
      `);

      res.json(users);
    } catch (error) {
      console.error('Errore nell\'ottenere gli utenti:', error);
      res.status(500).json({ message: 'Errore interno del server' });
    }
  }

  static async getAccessi(req, res) {
    try {
      const [accessi] = await pool.execute(`
        SELECT
          i.id,
          i.id_utente,
          DATE_FORMAT(i.data_ora, '%Y-%m-%d') as data_accesso,
          TIME_FORMAT(i.data_ora, '%H:%i') as orario_entrata,
          NULL as orario_uscita,
          u.nome as nome_utente,
          u.cognome as cognome_utente
        FROM Ingressi i
        LEFT JOIN Utenti u ON i.id_utente = u.id
        ORDER BY i.data_ora DESC
      `);

      res.json(accessi);
    } catch (error) {
      console.error('Errore nell\'ottenere gli accessi:', error);
      res.status(500).json({ message: 'Errore interno del server' });
    }
  }


  static async getAbbonamentiSimple(req, res) {
    try {
      const [abbonamenti] = await pool.execute(`
        SELECT
          a.id,
          a.id_utente,
          a.id_corso,
          DATE_FORMAT(a.data_inizio, '%Y-%m-%d') as data_inizio,
          a.durata_mesi,
          CASE
            WHEN DATE_ADD(a.data_inizio, INTERVAL a.durata_mesi MONTH) >= CURDATE()
            THEN true
            ELSE false
          END as attivo,
          c.nome_corso
        FROM Abbonamenti a
        LEFT JOIN Corsi c ON a.id_corso = c.id
        ORDER BY a.data_inizio DESC
      `);

      res.json(abbonamenti);
    } catch (error) {
      console.error('Errore nell\'ottenere gli abbonamenti:', error);
      res.status(500).json({ message: 'Errore interno del server' });
    }
  }


  static async getCorsiSimple(req, res) {
    try {
      const [corsi] = await pool.execute(`
        SELECT id, nome_corso, descrizione, durata_mesi_default
        FROM Corsi
        ORDER BY nome_corso
      `);

      res.json(corsi);
    } catch (error) {
      console.error('Errore nell\'ottenere i corsi:', error);
      res.status(500).json({ message: 'Errore interno del server' });
    }
  }


  static async checkSubscriptionIntegrity(req, res) {
    try {

      const [orphanedSubscriptions] = await pool.execute(`
        SELECT
          a.id,
          a.id_utente,
          a.id_corso,
          a.data_inizio,
          u.nome,
          u.cognome
        FROM Abbonamenti a
        JOIN Utenti u ON a.id_utente = u.id
        LEFT JOIN Corsi c ON a.id_corso = c.id
        WHERE c.id IS NULL
      `);


      const [subscriptionsWithoutUsers] = await pool.execute(`
        SELECT
          a.id,
          a.id_utente,
          a.id_corso,
          a.data_inizio
        FROM Abbonamenti a
        LEFT JOIN Utenti u ON a.id_utente = u.id
        WHERE u.id IS NULL
      `);

      res.json({
        success: true,
        data: {
          orphaned_subscriptions: orphanedSubscriptions,
          subscriptions_without_users: subscriptionsWithoutUsers
        }
      });

    } catch (error) {
      console.error('Errore nel controllo integrità abbonamenti:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server'
      });
    }
  }

  // Metodi per gestire i corsi
  static async getCorsi(req, res) {
    try {
      const [corsi] = await pool.execute(`
        SELECT
          c.id,
          c.nome_corso,
          c.descrizione,
          c.durata_mesi_default,
          COUNT(a.id) as abbonamenti_attivi
        FROM Corsi c
        LEFT JOIN Abbonamenti a ON c.id = a.id_corso
        AND DATE_ADD(a.data_inizio, INTERVAL a.durata_mesi MONTH) >= CURDATE()
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

  static async createCorso(req, res) {
    try {
      const { nome_corso, descrizione, durata_mesi_default } = req.body;

      // Validazione input
      if (!nome_corso || nome_corso.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Il nome del corso è obbligatorio'
        });
      }

      // Verifica che il corso non esista già
      const [existingCorso] = await pool.execute(
        'SELECT id FROM Corsi WHERE nome_corso = ?',
        [nome_corso.trim()]
      );

      if (existingCorso.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Un corso con questo nome esiste già'
        });
      }

      const [result] = await pool.execute(
        'INSERT INTO Corsi (nome_corso, descrizione, durata_mesi_default) VALUES (?, ?, ?)',
        [nome_corso.trim(), descrizione || '', durata_mesi_default || 1]
      );

      const [newCorso] = await pool.execute(
        'SELECT * FROM Corsi WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        data: newCorso[0],
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
