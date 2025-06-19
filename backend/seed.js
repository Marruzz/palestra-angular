const mysql = require('mysql2/promise');
const { faker, fa } = require('@faker-js/faker');

// Funzione per generare un codice fiscale casuale (formato semplificato)
function generateCodiceFiscale() {
  const consonanti = 'BCDFGHJKLMNPQRSTVWXYZ';
  const vocali = 'AEIOU';
  const numeri = '0123456789';

  let cf = '';
  // 6 caratteri per nome e cognome (semplificato)
  for (let i = 0; i < 6; i++) {
    cf += faker.helpers.arrayElement(consonanti.split(''));
  }
  // 2 cifre per anno
  cf += faker.string.numeric(2);
  // 1 lettera per mese
  cf += faker.helpers.arrayElement('ABCDEHLMPRST'.split(''));
  // 2 cifre per giorno
  cf += faker.string.numeric(2);
  // 4 caratteri finali
  cf += faker.helpers.arrayElement('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));
  cf += faker.string.numeric(3);
  cf += faker.helpers.arrayElement('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));

  return cf;
}

// Funzione per generare nuovi utenti
async function generateNewUsers(conn, numUtenti) {
  console.log(`\nGenerando ${numUtenti} nuovi utenti...`);

  const utentiGenerati = [];

  for (let i = 0; i < numUtenti; i++) {
    // Genera dati casuali per l'utente
    const nome = faker.person.firstName();
    const cognome = faker.person.lastName();
    const dataNascita = faker.date.between({
      from: new Date('1990-01-01'),
      to: new Date('2015-12-31')
    }).toISOString().slice(0, 10);
    const email = faker.internet.email({ firstName: nome, lastName: cognome }).toLowerCase();
    const codiceFiscale = generateCodiceFiscale();

    try {
      const [result] = await conn.execute(
        `INSERT INTO Utenti (nome, cognome, data_nascita, email, codice_fiscale) VALUES (?, ?, ?, ?, ?)`,
        [nome, cognome, dataNascita, email, codiceFiscale]
      );

      utentiGenerati.push({
        id: result.insertId,
        nome,
        cognome,
        email
      });

      console.log(`Utente ${i + 1}/${numUtenti} creato: ${nome} ${cognome} (ID: ${result.insertId})`);
    } catch (error) {
      console.error(`Errore nella creazione dell'utente ${i + 1}:`, error.message);
    }
  }

  console.log(`\n✅ Generati con successo ${utentiGenerati.length} nuovi utenti!`);
  return utentiGenerati;
}

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'rootpassword',
    database: 'palestra-angular'
  });

  // Genera un numero casuale di utenti tra 50 e 150
  const numeroNuoviUtenti = faker.number.int({ min: 50, max: 500 });
  console.log(`🎯 Generazione di ${numeroNuoviUtenti} nuovi utenti in corso...`);

  // Genera i nuovi utenti
  const nuoviUtenti = await generateNewUsers(conn, numeroNuoviUtenti);


  const [utentiDb] = await conn.query(`SELECT id FROM Utenti ORDER BY id`);
  const [corsiDb] = await conn.query(`SELECT id FROM Corsi ORDER BY id`);

  if (utentiDb.length === 0) {
    console.log('Nessun utente trovato nel database.');
    await conn.end();
    return;
  }


  console.log(`Trovati ${utentiDb.length} utenti e ${corsiDb.length} corsi nel database.`);

/*    // Crea ingressi casuali per ogni utente
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


/*   for (const utente of utentiDb) {

    const isActive = faker.number.float() < 0.7;

    const corsoRandom = faker.helpers.arrayElement(corsiDb);

    const durataMesi = faker.helpers.arrayElement([1, 6, 12]);

    let dataInizio;

    if (isActive) {

      dataInizio = faker.date.between({
        from: new Date(Date.now() - (durataMesi * 30 * 24 * 60 * 60 * 1000) / 2), // Iniziato al massimo a metà della durata fa
        to: new Date()
      });
    } else {

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


    const dataFine = new Date(dataInizio);
    dataFine.setMonth(dataFine.getMonth() + durataMesi);
    const isCurrentlyActive = dataFine > new Date();

    console.log(`Abbonamento creato per utente ${utente.id}: ${isCurrentlyActive ? 'ATTIVO' : 'SCADUTO'} - Corso ${corsoRandom.id}, ${durataMesi} mesi (${dataInizio.toDateString()} - ${dataFine.toDateString()})`);
  } */

  console.log('Seed completato con successo!');
  console.log(`Totale utenti processati: ${utentiDb.length}`);

  await conn.end();
})().catch(console.error);
