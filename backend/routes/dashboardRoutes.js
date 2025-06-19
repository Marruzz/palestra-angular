const express = require('express');
const DashboardController = require('../controllers/dashboardController');
const { upload } = require('../config/fileUpload');

const router = express.Router();



// Routes per gli utenti
router.get('/users', DashboardController.getUsers);
router.post('/users', DashboardController.createUser);
router.put('/users/:id', DashboardController.updateUser);
router.delete('/users/:id', DashboardController.deleteUser);

// Routes per i certificati medici
router.post('/users/:id/certificato', upload.single('certificato'), DashboardController.uploadCertificatoMedico);
router.get('/users/:id/certificato/:filename', DashboardController.downloadCertificatoMedico);

// Routes per i corsi
router.get('/corsi', DashboardController.getCorsi);
router.post('/corsi', DashboardController.createCorso);


router.get('/subscriptions', DashboardController.getSubscriptions);
router.post('/subscriptions', DashboardController.createSubscription);
router.put('/subscriptions/:id', DashboardController.updateSubscription);
router.delete('/subscriptions/:id', DashboardController.deleteSubscription);
router.get('/subscriptions/integrity-check', DashboardController.checkSubscriptionIntegrity);


router.get('/accesses', DashboardController.getAccesses);
router.post('/accesses', DashboardController.createAccess);
router.post('/accesses/multiple', DashboardController.createMultipleAccesses);
router.delete('/accesses/:id', DashboardController.deleteAccess);


router.get('/stats', DashboardController.getStats);


router.get('/Utenti', DashboardController.getUsersSimple);
router.get('/Ingressi', DashboardController.getAccessi);
router.get('/Abbonamenti', DashboardController.getAbbonamentiSimple);
router.get('/Corsi', DashboardController.getCorsiSimple);

module.exports = router;
