const express = require('express');
const DashboardController = require('../controllers/dashboardController');

const router = express.Router();

// RIMOZIONE AUTENTICAZIONE JWT - tutte le rotte sono ora pubbliche

// Rotte per gli utenti della palestra
router.get('/users', DashboardController.getUsers);
router.post('/users', DashboardController.createUser);
router.put('/users/:id', DashboardController.updateUser);
router.delete('/users/:id', DashboardController.deleteUser);

// Rotte per i corsi
router.get('/corsi', DashboardController.getCorsi);
router.post('/corsi', DashboardController.createCorso);

// Rotte per gli abbonamenti
router.get('/subscriptions', DashboardController.getSubscriptions);
router.post('/subscriptions', DashboardController.createSubscription);
router.put('/subscriptions/:id', DashboardController.updateSubscription);
router.delete('/subscriptions/:id', DashboardController.deleteSubscription);
router.get('/subscriptions/integrity-check', DashboardController.checkSubscriptionIntegrity);

// Rotte per gli accessi/ingressi
router.get('/accesses', DashboardController.getAccesses);
router.post('/accesses', DashboardController.createAccess);

// Rotte per le statistiche
router.get('/stats', DashboardController.getStats);

// Nuove rotte per i dati semplificati (per il calcolo delle statistiche)
router.get('/users-simple', DashboardController.getUsersSimple);
router.get('/accessi', DashboardController.getAccessi);
router.get('/abbonamenti-simple', DashboardController.getAbbonamentiSimple);
router.get('/corsi-simple', DashboardController.getCorsiSimple);

module.exports = router;
