# Specifica l'immagine base di Node.js
FROM node:20-alpine

# Imposta la directory di lavoro nell'immagine
WORKDIR /usr/src/app

# Copia package.json e package-lock.json (se esiste) PRIMA di altri file
# Questo sfrutta la cache di Docker: se questi file non cambiano,
# npm install non verrà rieseguito inutilmente.
COPY package*.json ./

# Installa le dipendenze dell'applicazione
RUN npm ci --production && \
    # Verifico specificamente che mysql2 sia installato
    npm list mysql2 || npm install mysql2 && \
    # Verifico specificamente che dotenv sia installato
    npm list dotenv || npm install dotenv && \
    # Rimuovo la cache di npm per ridurre le dimensioni dell'immagine
    npm cache clean --force

# Copia il resto del codice sorgente dell'applicazione
COPY . .

# Esponi la porta su cui l'applicazione è in ascolto
EXPOSE 3000

# Comando per avviare l'applicazione
CMD [ "node", "index.js" ]