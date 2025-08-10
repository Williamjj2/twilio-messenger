const http = require('http');
const fs = require('fs');
const path = require('path');

function loadEnvFile(filePath) {
  try {
    const full = path.resolve(filePath);
    if (!fs.existsSync(full)) return;
    const content = fs.readFileSync(full, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      if (!line || line.trim().startsWith('#')) continue;
      const idx = line.indexOf('=');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim().replace(/^"|"$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
    console.log(`Loaded env from ${filePath}`);
  } catch (e) {
    console.warn(`Could not load env file ${filePath}:`, e.message);
  }
}

loadEnvFile('.env.local');

const routes = {
  '/': (req, res) => {
    res.statusCode = 302; res.setHeader('Location', '/api/ui'); res.end();
  },
  '/api/ui': require('./api/ui.js'),
  '/api/health': require('./api/health.js'),
  '/api/send-message': require('./api/send-message.js'),
  '/api/twilio-conversations-webhook': require('./api/twilio-conversations-webhook.js'),
  '/api/entities/contacts': require('./api/entities/contacts.js'),
  '/api/entities/conversations': require('./api/entities/conversations.js'),
  '/api/entities/messages': require('./api/entities/messages.js'),
  '/api/entities/users': require('./api/entities/users.js'),
  '/api/debug-env': (req, res) => {
    res.json({
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      TWILIO_ACCOUNT_SID: !!process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: !!process.env.TWILIO_AUTH_TOKEN,
      TWILIO_PROXY_ADDRESS: process.env.TWILIO_PROXY_ADDRESS || null,
    });
  },
};

function notFound(req, res) { res.statusCode = 404; res.end('Not Found'); }

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const handler = routes[pathname] || notFound;
  // Response adapter (serverless-like)
  res.status = function (code) { res.statusCode = code; return res; };
  res.json = function (obj) { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(obj)); };
  res.send = function (body) {
    if (typeof body === 'object') {
      if (!res.getHeader('content-type')) res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify(body));
    } else {
      if (!res.getHeader('content-type')) res.setHeader('content-type', 'text/plain; charset=utf-8');
      res.end(String(body));
    }
  };
  try {
    await handler(req, res);
  } catch (e) {
    console.error('Unhandled error:', e);
    res.statusCode = 500; res.setHeader('content-type', 'text/plain');
    res.end('Internal');
  }
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
server.listen(port, () => {
  console.log(`Local dev server listening on http://localhost:${port}`);
  console.log('Try the UI at http://localhost:3000/api/ui');
});


