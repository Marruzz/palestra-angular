const express = require('express');
const AuthController = require('../controllers/authController');
const DashboardController = require('../controllers/dashboardController');

const router = express.Router();


router.post('/login', AuthController.login);
router.post('/register', AuthController.register);


router.get('/profile', AuthController.verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Profilo utente',
    user: req.user
  });
});


router.put('/accesses/:id', DashboardController.updateAccess);

module.exports = router;
