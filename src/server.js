import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import todosRouter from './routes/todos.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/devops';
const SERVICE_NAME = process.env.SERVICE_NAME || 'node-devops-starter';

app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Liveness probe
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', service: SERVICE_NAME, ts: new Date().toISOString() });
});

let mongoReady = false;

// Readiness probe
app.get('/ready', (req, res) => {
  if (mongoReady) {
    res.json({ ready: true });
  } else {
    res.status(503).json({ ready: false });
  }
});

// Routes
app.use('/api/todos', todosRouter);

// Not found handler
app.use((req, res) => {
  res.status(404).json({ error: 'not_found' });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'internal_error' });
});

async function connectWithRetry() {
  const maxRetries = 10;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(MONGO_URI, { dbName: 'devops' });
      mongoReady = true;
      console.log('Connected to MongoDB');
      return;
    } catch (e) {
      console.error(`MongoDB connection failed (attempt ${attempt}/${maxRetries}):`, e.message);
      await new Promise(r => setTimeout(r, Math.min(1000 * attempt, 5000)));
    }
  }
  console.error('Could not connect to MongoDB after retries. Exiting.');
  process.exit(1);
}

connectWithRetry();

const server = app.listen(PORT, () => {
  console.log(`${SERVICE_NAME} listening on port ${PORT}`);
});

// Graceful shutdown
function shutdown() {
  console.log('Shutting down...');
  server.close(async () => {
    await mongoose.disconnect().catch(() => {});
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);