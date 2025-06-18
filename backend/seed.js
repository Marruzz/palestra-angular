const mysql = require('mysql2/promise');
const { faker, fa } = require('@faker-js/faker');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'rootpassword',
    database: 'palestra-angular'
  });

  // Ottieni tutti gli utenti e i corsi disponibili
  const [utentiDb] = await conn.query(`SELECT id FROM Utenti ORDER BY id`);
  const [corsiDb] = await conn.query(`SELECT id FROM Corsi ORDER BY id`);

  if (utentiDb.length === 0) {
    console.log('Nessun utente trovato nel database.');
    await conn.end();
    return;
  }


  console.log(`Trovati ${utentiDb.length} utenti e ${corsiDb.length} corsi nel database.`);

  /* // Crea ingressi casuali per ogni utente
  for (const utente of utentiDb) {
    const ingressi = faker.number.int({ min: 0, max: 2 });
    for (let i = 0; i < ingressi; i++) {
      const quando = '2025-06-18';
      await conn.execute(
        `INSERT INTO Ingressi (id_utente, data_ora) VALUES (?, ?)`,
        [utente.id, quando.toString().slice(0, 19).replace('T', ' ')]
      );
    }
    console.log(`Ingressi creati per utente ${utente.id}: ${ingressi}`);
  } */

  // Crea abbonamenti per TUTTI gli utenti (garantito al 100%)
  for (const utente of utentiDb) {
    // 70% possibilità di abbonamento attivo, 30% scaduto (distribuzione più realistica)
    const isActive = faker.number.float() < 0.7;

    // Scegli un corso casuale
    const corsoRandom = faker.helpers.arrayElement(corsiDb);

    // Scegli una durata casuale (1-12 mesi)
    const durataMesi = faker.number.int({ min: 1, max: 12 });

    let dataInizio;

    if (isActive) {
      // Abbonamento attivo: iniziato di recente, durerà nel futuro
      dataInizio = faker.date.between({
        from: new Date(Date.now() - (durataMesi * 30 * 24 * 60 * 60 * 1000) / 2), // Iniziato al massimo a metà della durata fa
        to: new Date()
      });
    } else {
      // Abbonamento scaduto: iniziato e finito nel passato
      const fineAbbonamento = faker.date.between({
        from: new Date('2023-01-01'),
        to: new Date()
      });
      dataInizio = new Date(fineAbbonamento.getTime() - (durataMesi * 30 * 24 * 60 * 60 * 1000));
    }

    await conn.execute(
      `INSERT INTO Abbonamenti (id_utente, id_corso, data_inizio, durata_mesi) VALUES (?, ?, ?, ?)`,
      [utente.id, corsoRandom.id, dataInizio.toISOString().slice(0, 10), durataMesi]
    );

    // Calcola la data di fine per il log (stessa logica del database)
    const dataFine = new Date(dataInizio);
    dataFine.setMonth(dataFine.getMonth() + durataMesi);
    const isCurrentlyActive = dataFine > new Date();

    console.log(`Abbonamento creato per utente ${utente.id}: ${isCurrentlyActive ? 'ATTIVO' : 'SCADUTO'} - Corso ${corsoRandom.id}, ${durataMesi} mesi (${dataInizio.toDateString()} - ${dataFine.toDateString()})`);
  }

  console.log('Seed completato con successo!');
  console.log(`Totale utenti processati: ${utentiDb.length}`);

  await conn.end();
})().catch(console.error);
