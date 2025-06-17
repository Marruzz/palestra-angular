# Palestra Angular - Setup con Database MySQL

## Prerequisiti

1. **Node.js** (versione 16 o superiore)
2. **MySQL Server** installato e in esecuzione su localhost
3. **Angular CLI** (`npm install -g @angular/cli`)

## Setup del Database

1. Assicurati che MySQL sia in esecuzione su localhost
2. Crea il database:
```sql
CREATE DATABASE `palestra-angular` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Le tabelle verranno create automaticamente al primo avvio del backend

## Setup del Backend

1. Naviga nella cartella backend:
```bash
cd backend
```

2. Installa le dipendenze:
```bash
npm install
```

3. Configura le variabili d'ambiente nel file `.env` (già configurato con i tuoi parametri):
```
DB_HOST=localhost
DB_NAME=palestra-angular
DB_USER=root
DB_PASSWORD=rootpassword
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
PORT=3000
```

4. Avvia il server backend:
```bash
npm start
```

Il backend sarà disponibile su `http://localhost:3000`

## Setup del Frontend

1. Naviga nella cartella principale del progetto:
```bash
cd ..
```

2. Installa le dipendenze:
```bash
npm install
```

3. Avvia il server Angular:
```bash
npm start
```

Il frontend sarà disponibile su `http://localhost:4200`

## Credenziali di Default

Un utente di default verrà creato automaticamente:
- **Email**: admin@palestra.com
- **Password**: password

## Struttura del Progetto

```
palestra-angular/
├── src/                          # Frontend Angular
│   ├── app/
│   │   ├── Pages/
│   │   │   ├── login/           # Componente login (aggiornato)
│   │   │   └── Dashboard/
│   │   └── shared/
│   │       └── services/
│   │           └── auth.service.ts  # Servizio autenticazione
│   └── ...
├── backend/                      # Backend Node.js
│   ├── config/
│   │   └── database.js          # Configurazione database
│   ├── controllers/
│   │   └── authController.js    # Controller autenticazione
│   ├── routes/
│   │   └── authRoutes.js        # Rotte API
│   ├── .env                     # Variabili d'ambiente
│   ├── package.json
│   └── server.js                # Server principale
└── README.md
```

## API Endpoints

- `GET /api/health` - Health check del server
- `POST /api/auth/login` - Login utente
- `POST /api/auth/register` - Registrazione nuovo utente
- `GET /api/auth/profile` - Profilo utente (richiede autenticazione)

## Funzionalità Implementate

1. **Frontend**:
   - Componente login aggiornato per usare HTTP requests
   - Servizio di autenticazione con gestione token JWT
   - Gestione errori e stati di caricamento

2. **Backend**:
   - Server Express.js con MySQL
   - Autenticazione JWT
   - Hash delle password con bcrypt
   - Creazione automatica tabelle e utente default
   - Gestione CORS per Angular

3. **Database**:
   - Tabella `users` con campi: id, email, password, nome, timestamp
   - Connessione sicura con pool di connessioni

## Troubleshooting

1. **Errore di connessione al database**:
   - Verifica che MySQL sia in esecuzione
   - Controlla le credenziali nel file `.env`
   - Assicurati che il database `palestra-angular` esista

2. **Errore CORS**:
   - Il backend è configurato per accettare richieste da `http://localhost:4200`

3. **Errore "Cannot connect to server"**:
   - Assicurati che il backend sia in esecuzione su porta 3000
   - Verifica che non ci siano altri servizi sulla stessa porta
