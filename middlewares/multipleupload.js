const multer = require('multer');
const path = require('path');
var fs = require('fs');

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(__dirname, '../public/attachments');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      // Create unique filename with original extension
      const fileExt = path.extname(file.originalname);
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
      cb(null, fileName);
    }
  });
  
  // Create multer upload instance with file size limits
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
    fileFilter: function (req, file, cb) {
      // Accept common file types
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain', 'application/zip', 'application/x-rar-compressed'
      ];
      
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only images, documents, and archives are allowed.'), false);
      }
    }
  }).array('attachments', 5); // Accept up to 5 files with field name 'attachments'
  
  // Si

module.exports = upload;
