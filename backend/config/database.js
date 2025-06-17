const mysql = require("mysql2/promise");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "rootpassword",
  database: process.env.DB_NAME || "palestra-angular",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};


const pool = mysql.createPool(dbConfig);


async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Essiamo qua");
    connection.release();
    return true;
  } catch (error) {
    console.error("Capitano abbandonare la nave, ", error.message);
    return false;
  }
}


async function initializeTables() {
  try {
    const connection = await pool.getConnection();


    const createUtentiTable = `
      CREATE TABLE IF NOT EXISTS Utenti (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(50) NOT NULL,
        cognome VARCHAR(50) NOT NULL,
        data_nascita DATE NOT NULL,
        email VARCHAR(100) UNIQUE,
        codice_fiscale VARCHAR(16) NOT NULL UNIQUE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `;

    await connection.execute(createUtentiTable);


    const createCorsiTable = `
      CREATE TABLE IF NOT EXISTS Corsi (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome_corso VARCHAR(50) NOT NULL,
        descrizione TEXT,
        durata_mesi_default INT DEFAULT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `;

    await connection.execute(createCorsiTable);


    const createAbbonamentiTable = `
      CREATE TABLE IF NOT EXISTS Abbonamenti (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_utente INT NOT NULL,
        id_corso INT NOT NULL,
        data_inizio DATE NOT NULL,
        durata_mesi INT NOT NULL,
        data_fine DATE GENERATED ALWAYS AS ((data_inizio + interval durata_mesi month)) STORED,
        FOREIGN KEY (id_utente) REFERENCES Utenti(id) ON DELETE CASCADE,
        FOREIGN KEY (id_corso) REFERENCES Corsi(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `;

    await connection.execute(createAbbonamentiTable);


    const createIngressiTable = `
      CREATE TABLE IF NOT EXISTS Ingressi (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_utente INT NOT NULL,
        data_ora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_utente) REFERENCES Utenti(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `;

    await connection.execute(createIngressiTable);


    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nome VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `;

    await connection.execute(createUsersTable);


    const [existingCorsi] = await connection.execute("SELECT COUNT(*) as count FROM Corsi");
    if (existingCorsi[0].count !== 12) {
      const corsiDefault = [
        ['Arti marziali', 'Corso base - durata 1 mese', 1],
        ['MMA', 'Mixed Martial Arts - durata 1 mese', 1],
        ['Sala pesi', 'Allenamento pesi - durata 1 mese', 1],
        ['Cross-training', 'Funzionale - durata 1 mese', 1],
        ['Arti Marziali', 'Corso base - durata 6 mesi', 6],
        ['MMA', 'Mixed Martial Arts - durata 6 mesi', 6],
        ['Sala Pesi', 'Allenamento Pesi - durata 6 mesi', 6],
        ['Cross-training', 'Funzionale - durata 6 mesi', 6],
        ['Arti Marziali', 'Corso base - durata 12 mesi', 12],
        ['MMA', 'Mixed Martial Arts - durata 12 mesi', 12],
        ['Sala Pesi', 'Allenamento Pesi - durata 12 mesi', 12],
        ['Cross-training', 'Funzionale - durata 12 mesi', 12]
      ];
      await connection.execute("DELETE FROM Corsi");
      for (const corso of corsiDefault) {
        await connection.execute(
          "INSERT INTO Corsi (nome_corso, descrizione, durata_mesi_default) VALUES (?, ?, ?)",
          corso
        );
      }
    }


    const [existingUsers] = await connection.execute(
      "SELECT COUNT(*) as count FROM users"
    );

    if (existingUsers[0].count === 0) {
      const bcrypt = require("bcrypt");
      const hashedPassword = await bcrypt.hash("password", 10);

      await connection.execute(
        "INSERT INTO users (email, password, nome) VALUES (?, ?, ?)",
        ["admin@palestra.com", hashedPassword, "Admin"]
      );

      console.log(
        "Capo, per stavolta logga con \n admin@palestra.com \n password"
      );
    }


    connection.release();
  } catch (error) {
    console.error(
      "WAIT! TABLES DON'T LOVE YOU LIKE YOU LOVE THEM!",
      error.message
    );
  }
}

module.exports = {
  pool,
  testConnection,
  initializeTables,
};
