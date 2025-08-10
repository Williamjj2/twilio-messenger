const { getSupabaseClient } = require('../_utils/supabaseClient');
const { parseBody } = require('../_utils/parseBody');
const { applyCors } = require('../_utils/cors');

module.exports = async function handler(req, res) {
  if (applyCors(req, res)) return;
  try {
    const supabase = getSupabaseClient();
    if (req.method === 'GET') {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const search = url.searchParams.get('search') || '';
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .ilike('name', `%${search}%`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.json(data || []);
    }
    if (req.method === 'POST') {
      const payload = await parseBody(req);
      const { data, error } = await supabase
        .from('contacts')
        .insert({ name: payload.name, phone: payload.phone, photo_url: payload.photo_url || null })
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
      const { data, error } = await supabase
        .from('contacts')
        .update({ name: payload.name, phone: payload.phone, photo_url: payload.photo_url || null })
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return res.json(data);
    }
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('contacts endpoint error', err);
    return res.status(500).json({ error: 'Internal' });
  }
}


