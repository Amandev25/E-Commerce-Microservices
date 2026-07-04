import multer from 'multer';

// memoryStorage = keep the file in RAM (as req.file.buffer), don't write to disk.
const storage = multer.memoryStorage();

// Only allow image files — reject PDFs, videos, etc.
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);          // accept
  } else {
    cb(new Error('Only image files are allowed'), false); // reject
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // max 2 MB per file
});

export default upload;