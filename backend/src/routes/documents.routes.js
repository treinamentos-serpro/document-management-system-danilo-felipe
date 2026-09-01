const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const documentsController = require('../controllers/documents.controller');
const { maxFileSize, storageDirectory } = require('../config/storage');

fs.mkdirSync(storageDirectory, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: storageDirectory,
    filename: (req, file, callback) => {
      callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
    }
  }),
  limits: { fileSize: maxFileSize }
});

const router = express.Router();

router.post('/upload', upload.single('file'), documentsController.uploadDocument);
router.get('/documents', documentsController.listDocuments);
router.get('/documents/:id/download', documentsController.downloadDocument);

module.exports = router;