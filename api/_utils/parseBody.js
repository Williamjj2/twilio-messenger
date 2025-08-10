const querystring = require('querystring');

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    try {
      let data = '';
      req.on('data', (chunk) => {
        data += chunk;
      });
      req.on('end', () => resolve(data));
      req.on('error', reject);
    } catch (e) {
      reject(e);
    }
  });
}

async function parseBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  const contentType = (req.headers['content-type'] || '').split(';')[0].trim();
  const raw = await readRawBody(req);

  if (!raw) return {};

  if (contentType === 'application/json') {
    try { return JSON.parse(raw); } catch { return {}; }
  }

  if (contentType === 'application/x-www-form-urlencoded') {
    return querystring.parse(raw);
  }

  // Fallback: try JSON, else empty
  try { return JSON.parse(raw); } catch { return {}; }
}

module.exports = { parseBody };



