const { getSupabaseClient } = require('../_utils/supabaseClient');
const { parseBody } = require('../_utils/parseBody');
const { applyCors } = require('../_utils/cors');

module.exports = async function handler(req, res) {
  if (applyCors(req, res)) return;
  try {
    const supabase = getSupabaseClient();
    if (req.method === 'GET') {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const contactId = url.searchParams.get('contact_id');
      const order = url.searchParams.get('order') || 'last_message_time';
      let query = supabase.from('conversations').select('*');
      if (contactId) query = query.eq('contact_id', contactId);
      query = query.order(order, { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      return res.json(data || []);
    }
    if (req.method === 'POST') {
      const payload = await parseBody(req);
      const insertPayload = {
        contact_id: payload.contact_id,
        last_message_id: null,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from('conversations')
        .insert(insertPayload)
        .select('*')
        .single();
      if (error) throw error;
      return res.json(data);
    }
    if (req.method === 'PUT') {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const id = url.searchParams.get('id');
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const payload = await parseBody(req);
      const update = {};
      if (payload.last_message) update.last_message = payload.last_message;
      if (payload.last_message_time) update.last_message_time = payload.last_message_time;
      if (payload.unread_count !== undefined) update.unread_count = payload.unread_count;
      update.updated_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('conversations')
        .update(update)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return res.json(data);
    }
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('conversations endpoint error', err);
    return res.status(500).json({ error: 'Internal' });
  }
}


