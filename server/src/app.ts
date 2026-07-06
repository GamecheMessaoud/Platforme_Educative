import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import apiRoutes from './routes';

const app: Express = express();

// ── Body parsers (must come before any middleware that reads req.body) ──
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Security & logging ──
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
    ],
    credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));

// ── Debug request logger ──
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url} | Body keys: ${Object.keys(req.body || {}).join(', ') || '(none)'}`);
    next();
});

// ── Health check ──
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', message: 'KidTech Learn API is running' });
});

// ── Static files ──
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── API routes ──
app.use('/api', apiRoutes);

export default app;
