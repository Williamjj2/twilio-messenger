const { getSupabaseClient } = require('./_utils/supabaseClient');
const { parseBody } = require('./_utils/parseBody');
const { verifyTwilioRequest } = require('./_utils/twilioVerify');

// Twilio status callback webhook (application/x-www-form-urlencoded)
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }
  try {
    const supabase = getSupabaseClient();
    const payload = await parseBody(req);
    req._parsedBody = payload;
    const isValid = await verifyTwilioRequest(req);
    if (!isValid) return res.status(403).send('Invalid signature');
    const { MessageSid, MessageStatus } = payload || {};
    if (!MessageSid) return res.status(400).send('Missing MessageSid');

    await supabase
      .from('messages')
      .update({ status: MessageStatus || null })
      .eq('twilio_sid', MessageSid);

    // Twilio expects 200 OK quickly
    return res.status(200).send('OK');
  } catch (err) {
    console.error('status-callback error', err);
    return res.status(500).send('Internal');
  }
}


