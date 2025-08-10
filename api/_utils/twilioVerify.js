const twilio = require('twilio');

function buildRequestUrl(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const path = req.url || '';
  return `${proto}://${host}${path}`;
}

async function verifyTwilioRequest(req) {
  const shouldValidate = (process.env.TWILIO_WEBHOOK_VALIDATE || 'true').toLowerCase() === 'true';
  if (!shouldValidate) return true;

  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return false;

  const signature = req.headers['x-twilio-signature'];
  if (!signature) return false;

  // Vercel: body may not be available in raw; we re-parse body upstream and attach to req._parsedBody
  const body = req._parsedBody || {};
  const url = buildRequestUrl(req);
  try {
    const valid = twilio.validateRequest(authToken, signature, url, body);
    return !!valid;
  } catch {
    return false;
  }
}

module.exports = { verifyTwilioRequest };



