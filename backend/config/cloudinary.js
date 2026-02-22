const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dh2cnzua2',
  api_key: process.env.CLOUDINARY_API_KEY || '122982425492631',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'cLoVc3n_K7GYEkWH6cBozI1H054'
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'testimonial-videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'webm', 'ogg', 'mov', 'quicktime'],
    transformation: [{ quality: 'auto' }],
    // Max file size: 100MB
    maxFileSize: 100 * 1024 * 1024
  }
});

// File filter for video types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    req.fileValidationError = 'Only video files (MP4, WebM, OGG, MOV) are allowed!';
    cb(new Error('Only video files are allowed!'), false);
  }
};

// Create multer upload instance with Cloudinary storage
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: fileFilter
});

module.exports = { cloudinary, upload };
