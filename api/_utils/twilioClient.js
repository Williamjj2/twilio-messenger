const twilio = require('twilio');

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    throw new Error('TWILIO_ACCOUNT_SID e TWILIO_AUTH_TOKEN são obrigatórios.');
  }
  return twilio(accountSid, authToken);
}

module.exports = { getTwilioClient };



