const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configurazione per il salvataggio dei file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', 'uploads', 'certificati');
    // Crea la directory se non esiste
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Usa userId + timestamp + estensione originale per evitare conflitti di nome
    const userId = req.params.id;
    const timestamp = Date.now();
    const fileExt = path.extname(file.originalname);
    cb(null, `user_${userId}_${timestamp}${fileExt}`);
  }
});

// Filtro per accettare solo file PDF
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo file PDF sono accettati'), false);
  }
};

// Configurazione di multer
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // limite di 5MB
  }
});

module.exports = { upload };
