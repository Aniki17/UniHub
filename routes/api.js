const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import controllers
const domainController = require('../controllers/domainController');
const subjectController = require('../controllers/subjectController');
const yearController = require('../controllers/yearController');
const documentController = require('../controllers/documentController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/documents');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'document-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function(req, file, cb) {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
});

// Domain routes
router.get('/domains', domainController.getAllDomains);
router.get('/domains/:id', domainController.getDomainById);
router.post('/domains', domainController.createDomain);
router.put('/domains/:id', domainController.updateDomain);
router.delete('/domains/:id', domainController.deleteDomain);

// Subject routes
router.get('/subjects', subjectController.getAllSubjects);
router.get('/subjects/:id', subjectController.getSubjectById);
router.post('/subjects', subjectController.createSubject);
router.put('/subjects/:id', subjectController.updateSubject);
router.delete('/subjects/:id', subjectController.deleteSubject);

// Academic Year routes
router.get('/years', yearController.getAllYears);
router.get('/years/current', yearController.getCurrentYear);
router.get('/years/:id', yearController.getYearById);
router.post('/years', yearController.createYear);
router.put('/years/:id', yearController.updateYear);
router.delete('/years/:id', yearController.deleteYear);

// Document routes
router.get('/documents', documentController.getAllDocuments);
router.get('/documents/:id', documentController.getDocumentById);
router.post('/documents', upload.single('file'), documentController.uploadDocument);
router.put('/documents/:id', upload.single('file'), documentController.updateDocument);
router.delete('/documents/:id', documentController.deleteDocument);

module.exports = router;