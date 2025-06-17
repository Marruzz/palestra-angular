const express = require('express');
const AuthController = require('../controllers/authController');
const DashboardController = require('../controllers/dashboardController');

const router = express.Router();

// Rotte di autenticazione
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);

// Rotta protetta di esempio
router.get('/profile', AuthController.verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Profilo utente',
    user: req.user
  });
});

// Route per aggiornare un accesso
router.put('/accesses/:id', DashboardController.updateAccess);

module.exports = router;
