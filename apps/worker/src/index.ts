import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handleGetMenu } from './handlers/menu';

type AppBindings = {
  db_binding_01: D1Database;
  r2_binding_01: R2Bucket;
};

const app = new Hono<{ Bindings: AppBindings }>();

// CORS middleware
app.use('/api/*', cors({
  origin: ['http://localhost:5173', 'https://pg-cbc-endes.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'cbc-endes-worker',
    version: '0.0.1'
  });
});

// Test endpoint
app.get('/api/test', (c) => {
  return c.json({
    message: 'Worker endpoint disponible',
    hono: true,
    typescript: true
  });
});

// Menu endpoint
app.get('/api/menu', handleGetMenu);

export default app;

