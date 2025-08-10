const { getSupabaseClient } = require('../_utils/supabaseClient');
const { parseBody } = require('../_utils/parseBody');
const { applyCors } = require('../_utils/cors');

module.exports = async function handler(req, res) {
  if (applyCors(req, res)) return;
  try {
    const supabase = getSupabaseClient();
    if (req.method === 'GET') {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const conversationId = url.searchParams.get('conversation_id');
      if (!conversationId) return res.status(400).json({ error: 'Missing conversation_id' });
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true });
      if (error) throw error;
      // adapt to UI naming
      const adapted = (data || []).map((m) => ({
        id: m.id,
        conversation_id: m.conversation_id,
        sender_phone: m.sender,
        receiver_phone: m.receiver,
        content: m.body,
        message_type: m.type,
        media_url: m.content_url,
        status: m.status,
        is_outgoing: m.sender ? true : false,
        created_date: m.timestamp,
        twilio_sid: m.twilio_sid,
      }));
      return res.json(adapted);
    }
    if (req.method === 'POST') {
      const payload = await parseBody(req);
      const insert = {
        conversation_id: payload.conversation_id,
        sender: payload.sender_phone,
        receiver: payload.receiver_phone,
        type: payload.message_type || 'text',
        body: payload.content || null,
        content_url: payload.media_url || null,
        status: payload.status || null,
        twilio_sid: payload.twilio_sid || null,
      };
      const { data, error } = await supabase
        .from('messages')
        .insert(insert)
        .select('*')
        .single();
      if (error) throw error;
      return res.json({ id: data.id });
    }
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('messages endpoint error', err);
    return res.status(500).json({ error: 'Internal' });
  }
}


