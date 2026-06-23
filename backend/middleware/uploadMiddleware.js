const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create base uploads directory if it doesn't exist
const baseUploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(baseUploadsDir)) {
  fs.mkdirSync(baseUploadsDir, { recursive: true });
}

// Subfolders to initialize
const subfolders = ['avatars', 'products', 'projects', 'gallery', 'categories', 'collections', 'misc'];
subfolders.forEach(folder => {
  const dir = path.join(baseUploadsDir, folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, baseUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter (images and videos)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|gif|mp4|webm|mov/;
  const mimetype = allowedExtensions.test(file.mimetype);
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Error: Only images (jpg, png, webp, gif) and videos (mp4, webm) are allowed!'));
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Max 50MB file size
  fileFilter
});

module.exports = upload;
