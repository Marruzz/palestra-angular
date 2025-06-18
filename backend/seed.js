const mysql = require('mysql2/promise');
const { faker, fa } = require('@faker-js/faker');

const NUM_UTENTI = faker.number.int({ min: 50, max: 500 });
const MAX_INGRESSI_PER_UTENTE = faker.number.int({ min: 0, max: 25 });

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'rootpassword',
    database: 'palestra-angular'
  });


  let utentiIds = [];
  for (let i = 0; i < NUM_UTENTI; i++) {
    const nome = faker.person.firstName();
    const cognome = faker.person.lastName();
    const email = faker.internet.email({ firstName: nome, lastName: cognome });
    const dataNascita = faker.date.past({ years: 90, refDate: new Date(2005, 0, 1) });
    const cf = faker.string.alphanumeric(16).toUpperCase();

    const [res] = await conn.execute(
      `INSERT INTO Utenti (nome, cognome, data_nascita, email, codice_fiscale)
       VALUES (?, ?, ?, ?, ?)`,
      [nome, cognome, dataNascita.toISOString().slice(0, 10), email, cf]
    );

    utentiIds.push(res.insertId);
    console.log(`Utente ${i + 1}/${NUM_UTENTI} creato: ${nome} ${cognome}`);
  }





  const [corsiDb] = await conn.query(`SELECT id FROM Corsi`);

  for (const uid of utentiIds) {
    const n = faker.number.int({ min: 1, max: 2 });
    const corsiScelti = faker.helpers.shuffle(corsiDb).slice(0, n);
    for (const corso of corsiScelti) {
      const durata = faker.helpers.arrayElement([1, 6, 12]);
      const inizio = faker.date.past({ years: 1 });
      await conn.execute(
        `INSERT INTO Abbonamenti (id_utente, id_corso, data_inizio, durata_mesi)
         VALUES (?, ?, ?, ?)`,
        [uid, corso.id, inizio.toISOString().slice(0, 10), durata]
      );
      console.log(`Abbonamento creato per utente ${uid} al corso ${corso.id}`);
    }
  }


  for (const uid of utentiIds) {
    const ingressi = faker.number.int({ min: 0, max: MAX_INGRESSI_PER_UTENTE });
    for (let i = 0; i < ingressi; i++) {
      const quando = faker.date.recent({ days: 180 });
      await conn.execute(
        `INSERT INTO Ingressi (id_utente, data_ora) VALUES (?, ?)`,
        [uid, quando.toISOString().slice(0, 19).replace('T', ' ')]
      );
    }
    console.log(`Ingressi creati per utente ${uid}: ${ingressi}`);
  }

  console.log('Seed completato.');
  await conn.end();
})();
