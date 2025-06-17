const express = require('express');
const cors = require('cors');
const { testConnection, initializeTables } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({
  origin: 'http://localhost:4200', // URL del frontend Angular
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
    }
    await initializeTables();
    app.listen(PORT, () => {
      console.log(`🚀 Server in ascolto sulla porta ${PORT}`);
      console.log(`📊 API Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 API Login: http://localhost:${PORT}/api/auth/login`);
      console.log('');
      console.log('💡 Credenziali di default:');
      console.log('   Email: admin@palestra.com');
      console.log('   Password: password');
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
