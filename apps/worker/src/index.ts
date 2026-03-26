import { Hono } from 'hono';
import { cors } from 'hono/cors';

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
    message: 'Worker de prueba funcionando correctamente',
    hono: true,
    typescript: true
  });
});

// D1 Test endpoint
app.get('/api/db/test', async (c) => {
  try {
    const result = await c.env.DB.prepare('SELECT * FROM test_items').all();
    return c.json({
      success: true,
      data: result.results,
      message: 'Conexión D1 funcionando correctamente'
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

// R2 Upload endpoint
app.post('/api/storage/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    const key = `uploads/${Date.now()}-${file.name}`;
    await c.env.BUCKET.put(key, file.stream(), {
      httpMetadata: { contentType: file.type }
    });

    return c.json({
      success: true,
      key: key,
      message: 'File uploaded successfully'
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

// R2 Download endpoint
app.get('/api/storage/:key', async (c) => {
  try {
    const key = c.req.param('key');
    const object = await c.env.BUCKET.get(key);

    if (!object) {
      return c.json({ error: 'File not found' }, 404);
    }

    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpContentType || 'application/octet-stream'
      }
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default app;

// Types
type AppBindings = {
  DB: D1Database;
  BUCKET: R2Bucket;
  ENV: string;
};
