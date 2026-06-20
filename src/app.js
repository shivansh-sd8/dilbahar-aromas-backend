import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import env from './config/env.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();

app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS — allow the configured client origin(s) with credentials.
// CLIENT_ORIGIN may be a comma-separated list (e.g. "https://dilbahararomas.com,https://www.dilbahararomas.com").
const allowedOrigins = env.clientOrigin
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (curl, server-side fetch) with no Origin header.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin.replace(/\/$/, ''))) return callback(null, true);
      return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

// Basic rate limiting on the API surface
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 600,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
