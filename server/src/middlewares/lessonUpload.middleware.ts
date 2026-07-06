import multer from 'multer';
import path from 'path';
import fs from 'fs';

const RESOURCE_DIR = path.join(process.cwd(), 'uploads', 'lesson-resources');

// Ensure directory exists
if (!fs.existsSync(RESOURCE_DIR)) {
    fs.mkdirSync(RESOURCE_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, RESOURCE_DIR);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `resource-${uniqueSuffix}${ext}`);
    },
});

const ALLOWED_EXTENSIONS = ['.pdf'];

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('يسمح فقط بملفات PDF كمرجع للدرس'));
    }
};

export const lessonUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB for PDF
});
