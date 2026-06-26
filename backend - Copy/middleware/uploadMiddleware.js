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

let sharp;
try {
  sharp = require('sharp');
} catch (err) {
  console.warn('⚠️ sharp is not installed. Image compression will be disabled. Run "npm install sharp" to enable it.');
}
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

const multerUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Max 50MB file size
  fileFilter
});

const processFile = async (file) => {
  if (!file) return;
  // only process images
  if (!file.mimetype.startsWith('image/')) return;
  if (!sharp) return;
  
  try {
    const tempPath = file.path + '.tmp';
    const buffer = await fs.promises.readFile(file.path);
    let pipeline = sharp(buffer);
    
    // Apply 80-85% quality compression
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
      pipeline = pipeline.jpeg({ quality: 82 });
    } else if (file.mimetype === 'image/png') {
      pipeline = pipeline.png({ quality: 82 });
    } else if (file.mimetype === 'image/webp') {
      pipeline = pipeline.webp({ quality: 82 });
    } else if (file.mimetype === 'image/gif') {
      pipeline = pipeline.gif({ animated: true });
    } else {
      pipeline = pipeline.webp({ quality: 82 });
    }
    
    await pipeline.toFile(tempPath);
    
    // Replace original with compressed
    await fs.promises.unlink(file.path);
    await fs.promises.rename(tempPath, file.path);
  } catch (err) {
    console.error('Error compressing image:', err);
  }
};

const processImages = async (req) => {
  if (req.file) {
    await processFile(req.file);
  }
  if (req.files) {
    if (Array.isArray(req.files)) {
      await Promise.all(req.files.map(processFile));
    } else {
      const tasks = [];
      for (const field in req.files) {
        tasks.push(...req.files[field].map(processFile));
      }
      await Promise.all(tasks);
    }
  }
};

const wrapUpload = (multerMiddleware) => {
  return (req, res, next) => {
    multerMiddleware(req, res, async (err) => {
      if (err) return next(err);
      await processImages(req);
      next();
    });
  };
};

module.exports = {
  single: (field) => wrapUpload(multerUpload.single(field)),
  array: (field, maxCount) => wrapUpload(multerUpload.array(field, maxCount)),
  fields: (fields) => wrapUpload(multerUpload.fields(fields)),
  none: () => wrapUpload(multerUpload.none()),
  any: () => wrapUpload(multerUpload.any())
};
