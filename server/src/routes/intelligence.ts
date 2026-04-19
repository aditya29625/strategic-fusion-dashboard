import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getAll, getById, deleteById } from '../controllers/intelligenceController';
import { uploadCsv, uploadJson, uploadXlsx, uploadImage } from '../controllers/uploadController';

const router = Router();

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_, file, cb) => {
    const allowed = [
      'text/csv',
      'application/json',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];
    if (allowed.includes(file.mimetype) || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// Intelligence CRUD
router.get('/', getAll);
router.get('/:id', getById);
router.delete('/:id', deleteById);

// Upload routes
router.post('/upload/csv', upload.single('file'), uploadCsv);
router.post('/upload/json', upload.single('file'), uploadJson);
router.post('/upload/xlsx', upload.single('file'), uploadXlsx);
router.post('/upload/image', upload.single('file'), uploadImage);

export default router;
