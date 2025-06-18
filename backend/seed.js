const mysql = require('mysql2/promise');
const { faker, fa } = require('@faker-js/faker');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'rootpassword',
    database: 'palestra-angular'
  });

  // Get existing users from the database
  const [utentiDb] = await conn.query(`SELECT id FROM Utenti ORDER BY id`);

  if (utentiDb.length === 0) {
    console.log('Nessun utente trovato nel database.');
    await conn.end();
    return;
  }

  console.log(`Trovati ${utentiDb.length} utenti nel database.`);

  // Create entries for each existing user
  for (const utente of utentiDb) {
    const ingressi = faker.number.int({ min: 0, max: 2 });
    for (let i = 0; i < ingressi; i++) {
      // Generate random date (can be today or in the past)
      const quando = '2025-06-18';
      await conn.execute(
        `INSERT INTO Ingressi (id_utente, data_ora) VALUES (?, ?)`,
        [utente.id, quando.toString().slice(0, 19).replace('T', ' ')]
      );
    }
    console.log(`Ingressi creati per utente ${utente.id}: ${ingressi}`);
  }

  console.log('Seed completato.');
  await conn.end();
})();
