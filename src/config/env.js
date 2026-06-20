import dotenv from 'dotenv';

dotenv.config();

const env = {
  port: process.env.PORT || 5050,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dilbahar_aromas',
  jwtSecret: process.env.JWT_SECRET || 'dev-insecure-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@dilbahararomas.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
  otelEnabled: process.env.OTEL_ENABLED === 'true',
};

export const isProd = env.nodeEnv === 'production';

// Fail fast in production if critical secrets are missing or left at insecure defaults.
if (isProd) {
  const problems = [];
  if (!process.env.MONGODB_URI) {
    problems.push('MONGODB_URI must be set (use your MongoDB Atlas connection string).');
  }
  if (!process.env.CLIENT_ORIGIN) {
    problems.push('CLIENT_ORIGIN must be set to your site origin(s), e.g. https://dilbahararomas.com');
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-insecure-secret-change-me') {
    problems.push('JWT_SECRET must be set to a long, random, unique value.');
  }
  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === 'ChangeMe123!') {
    problems.push('ADMIN_PASSWORD must be changed from the default before seeding.');
  }
  if (problems.length) {
    // eslint-disable-next-line no-console
    console.error(`\nRefusing to start in production with insecure configuration:\n- ${problems.join('\n- ')}\n`);
    process.exit(1);
  }
}

export default env;
