const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { testConnection, initializeTables } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API del backend palestra-angular funzionante',
    timestamp: new Date().toISOString()
  });
});
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint non trovato'
  });
});
app.use((error, req, res, next) => {
  console.error('Errore:', error);
  
  // Gestione errori di multer
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File troppo grande. Dimensione massima: 5MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Errore nell\'upload del file: ' + error.message
    });
  }
  
  // Gestione errori personalizzati per i tipi di file
  if (error.message === 'Solo file PDF sono accettati') {
    return res.status(400).json({
      success: false,
      message: 'Solo file PDF sono accettati'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Errore interno del server'
  });
});
async function startServer() {
  try {
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('❌ Impossibile connettersi al database. Il server non verrà avviato.');
      process.exit(1);
    }    await initializeTables();
    app.listen(PORT, () => {
      console.log(`🚀 Server avviato su http://localhost:${PORT}`);
      console.log('admin@palestra.com \n password');
      
    });

  } catch (error) {
    console.error('❌ Errore durante l\'avvio del server:', error);
    process.exit(1);
  }
}
process.on('SIGINT', () => {
  console.log('\n🛑 Server in chiusura...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Server in chiusura...');
  process.exit(0);
});

startServer();
