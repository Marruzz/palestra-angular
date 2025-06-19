const mysql = require("mysql2/promise");
const { faker } = require("@faker-js/faker");

faker.locale = "it";

function generateCodiceFiscale() {
  const consonanti = "BCDFGHJKLMNPQRSTVWXYZ";
  const vocali = "AEIOU";
  let cf = "";
  for (let i = 0; i < 6; i++) {
    cf += faker.helpers.arrayElement(consonanti.split(""));
  }
  cf += faker.string.numeric(2);
  cf += faker.helpers.arrayElement("ABCDEHLMPRST".split(""));
  cf += faker.string.numeric(2)
  cf += faker.helpers.arrayElement("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""));
  cf += faker.string.numeric(3);
  cf += faker.helpers.arrayElement("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""));

  return cf;
}

async function clearAllTables(conn) {
  console.log("🗑️  Svuotamento tabelle in corso...");

  try {
    await conn.execute("SET FOREIGN_KEY_CHECKS = 0");

    await conn.execute("DELETE FROM Ingressi");
    await conn.execute("DELETE FROM Abbonamenti");
    await conn.execute("DELETE FROM Utenti");
    await conn.execute("DELETE FROM Corsi");

    await conn.execute("ALTER TABLE Ingressi AUTO_INCREMENT = 1");
    await conn.execute("ALTER TABLE Abbonamenti AUTO_INCREMENT = 1");
    await conn.execute("ALTER TABLE Utenti AUTO_INCREMENT = 1");
    await conn.execute("ALTER TABLE Corsi AUTO_INCREMENT = 1");

    await conn.execute("SET FOREIGN_KEY_CHECKS = 1");

    console.log("✅ Tabelle svuotate con successo!");
  } catch (error) {
    console.error("❌ Errore nello svuotamento delle tabelle:", error.message);
    throw error;
  }
}

async function createCorsi(conn) {
  console.log("\n📚 Creazione corsi in corso...");

  const corsi = [
    {
      nome: "Arti Marziali",
      descrizione: "Corso base - durata 1 mese",
      durata: 1,
    },
    {
      nome: "MMA",
      descrizione: "Mixed Martial Arts - durata 1 mese",
      durata: 1,
    },
    {
      nome: "Sala Pesi",
      descrizione: "Allenamento pesi - durata 1 mese",
      durata: 1,
    },
    {
      nome: "Cross-training",
      descrizione: "Funzionale - durata 1 mese",
      durata: 1,
    },
    {
      nome: "Arti Marziali",
      descrizione: "Corso intermedio - durata 6 mesi",
      durata: 6,
    },
    {
      nome: "MMA",
      descrizione: "Mixed Martial Arts - durata 6 mesi",
      durata: 6,
    },
    {
      nome: "Sala Pesi",
      descrizione: "Allenamento Pesi - durata 6 mesi",
      durata: 6,
    },
    {
      nome: "Cross-training",
      descrizione: "Funzionale - durata 6 mesi",
      durata: 6,
    },
    {
      nome: "Arti Marziali",
      descrizione: "Corso avanzato - durata 12 mesi",
      durata: 12,
    },
    {
      nome: "MMA",
      descrizione: "Mixed Martial Arts - durata 12 mesi",
      durata: 12,
    },
    {
      nome: "Sala Pesi",
      descrizione: "Allenamento Pesi - durata 12 mesi",
      durata: 12,
    },
    {
      nome: "Cross-training",
      descrizione: "Funzionale - durata 12 mesi",
      durata: 12,
    },
  ];

  const corsiCreati = [];

  for (const corso of corsi) {
    try {
      const [result] = await conn.execute(
        "INSERT INTO Corsi (nome_corso, descrizione, durata_mesi_default) VALUES (?, ?, ?)",
        [corso.nome, corso.descrizione, corso.durata]
      );

      corsiCreati.push({
        id: result.insertId,
        nome: corso.nome,
        durata: corso.durata,
      });

      console.log(
        `Corso creato: ${corso.nome} (${corso.durata} mesi) - ID: ${result.insertId}`
      );
    } catch (error) {
      console.error(
        `Errore nella creazione del corso ${corso.nome}:`,
        error.message
      );
    }
  }

  console.log(`✅ Creati ${corsiCreati.length} corsi con successo!`);
  return corsiCreati;
}

async function createUtenti(conn, numeroUtenti = 368) {
  console.log(`\n👥 Creazione di ${numeroUtenti} utenti in corso...`);

  const utentiCreati = [];

  for (let i = 0; i < numeroUtenti; i++) {
    const nome = faker.person.firstName();
    const cognome = faker.person.lastName();
    const dataNascita = faker.date
      .between({
        from: new Date("1990-01-01"),
        to: new Date("2015-12-31"),
      })
      .toISOString()
      .slice(0, 10);
    const email = faker.internet
      .email({ firstName: nome, lastName: cognome })
      .toLowerCase();
    const codiceFiscale = generateCodiceFiscale();

    try {
      const [result] = await conn.execute(
        "INSERT INTO Utenti (nome, cognome, data_nascita, email, codice_fiscale) VALUES (?, ?, ?, ?, ?)",
        [nome, cognome, dataNascita, email, codiceFiscale]
      );

      utentiCreati.push({
        id: result.insertId,
        nome,
        cognome,
        email,
        dataNascita,
      });

      if ((i + 1) % 20 === 0) {
        console.log(`Creati ${i + 1}/${numeroUtenti} utenti...`);
      }
    } catch (error) {
      console.error(
        `Errore nella creazione dell'utente ${i + 1}:`,
        error.message
      );
    }
  }

  console.log(`✅ Creati ${utentiCreati.length} utenti con successo!`);
  return utentiCreati;
}

async function createAbbonamenti(conn, utenti, corsi) {
  console.log("\n💳 Creazione abbonamenti in corso...");

  const abbonamentiCreati = [];

  for (const utente of utenti) {
    const hasSubscription = faker.number.float() < 0.8;

    if (!hasSubscription) continue;

    const numSubscriptions = faker.number.float() < 0.1 ? 2 : 1;

    for (let i = 0; i < numSubscriptions; i++) {
      const corsoRandom = faker.helpers.arrayElement(corsi);
      const durataMesi = corsoRandom.durata;

      const isActive = faker.number.float() < 0.6; // 60% chance of active subscription

      let dataInizio;

      if (isActive) {
        const maxMonthsAgo = Math.min(durataMesi - 1, 6); // Don't go beyond duration or 6 months
        dataInizio = faker.date.between({
          from: new Date(Date.now() - maxMonthsAgo * 30 * 24 * 60 * 60 * 1000),
          to: new Date(),
        });
      } else {
        const endDate = faker.date.between({
          from: new Date("2023-01-01"),
          to: new Date(),
        });
        dataInizio = new Date(
          endDate.getTime() - durataMesi * 30 * 24 * 60 * 60 * 1000
        );
      }

      try {
        const [result] = await conn.execute(
          "INSERT INTO Abbonamenti (id_utente, id_corso, data_inizio, durata_mesi) VALUES (?, ?, ?, ?)",
          [
            utente.id,
            corsoRandom.id,
            dataInizio.toISOString().slice(0, 10),
            durataMesi,
          ]
        );

        const dataFine = new Date(dataInizio);
        dataFine.setMonth(dataFine.getMonth() + durataMesi);
        const isCurrentlyActive = dataFine > new Date();

        abbonamentiCreati.push({
          id: result.insertId,
          utenteId: utente.id,
          corsoId: corsoRandom.id,
          dataInizio,
          dataFine,
          isActive: isCurrentlyActive,
        });
      } catch (error) {
        console.error(
          `Errore nella creazione abbonamento per utente ${utente.id}:`,
          error.message
        );
      }
    }
  }

  const activeSubscriptions = abbonamentiCreati.filter(
    (a) => a.isActive
  ).length;
  const expiredSubscriptions = abbonamentiCreati.length - activeSubscriptions;

  console.log(`✅ Creati ${abbonamentiCreati.length} abbonamenti:`);
  console.log(`   - ${activeSubscriptions} attivi`);
  console.log(`   - ${expiredSubscriptions} scaduti`);

  return abbonamentiCreati;
}

async function createIngressi(conn, abbonamenti) {
  console.log("\n🚪 Creazione ingressi in corso...");

  const ingressiCreati = [];
  const today = new Date();
  const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const activeSubscriptions = abbonamenti.filter((a) => a.isActive);

  for (const abbonamento of activeSubscriptions) {
    const numIngressi = faker.number.int({ min: 0, max: 30 });

    for (let i = 0; i < numIngressi; i++) {
      const dataOra = faker.date.between({
        from: oneMonthAgo,
        to: today,
      });

      const hour = faker.number.int({ min: 6, max: 23 });
      const minute = faker.number.int({ min: 0, max: 59 });
      dataOra.setHours(hour, minute, 0, 0);

      try {
        const [result] = await conn.execute(
          "INSERT INTO Ingressi (id_utente, data_ora) VALUES (?, ?)",
          [
            abbonamento.utenteId,
            dataOra.toISOString().slice(0, 19).replace("T", " "),
          ]
        );

        ingressiCreati.push({
          id: result.insertId,
          utenteId: abbonamento.utenteId,
          dataOra,
        });
      } catch (error) {
        console.error(
          `Errore nella creazione ingresso per utente ${abbonamento.utenteId}:`,
          error.message
        );
      }
    }
  }

  console.log(
    `✅ Creati ${ingressiCreati.length} ingressi per ${activeSubscriptions.length} utenti attivi`
  );
  return ingressiCreati;
}

async function seedDatabase() {
  const conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "rootpassword",
    database: "palestra-angular",
  });

  try {
    console.log("🌱 Avvio seed del database...\n");

    await clearAllTables(conn);

    const corsi = await createCorsi(conn);
    const utenti = await createUtenti(
      conn,
      faker.number.int({ min: 80, max: 150 })
    );
    const abbonamenti = await createAbbonamenti(conn, utenti, corsi);
    const ingressi = await createIngressi(conn, abbonamenti);

    console.log("\n📊 RIEPILOGO SEED:");
    console.log(`   - ${corsi.length} corsi creati`);
    console.log(`   - ${utenti.length} utenti creati`);
    console.log(`   - ${abbonamenti.length} abbonamenti creati`);
    console.log(`   - ${ingressi.length} ingressi creati`);
    console.log("\n🎉 Seed completato con successo!");
  } catch (error) {
    console.error("❌ Errore durante il seed:", error);
  } finally {
    await conn.end();
  }
}

seedDatabase().catch(console.error);
