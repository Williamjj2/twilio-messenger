const { getSupabaseClient } = require('../_utils/supabaseClient');
const { parseBody } = require('../_utils/parseBody');
const { applyCors } = require('../_utils/cors');

// Para simplificar, teremos um único usuário (perfil) armazenado em uma tabela "profiles".
// Se não existir, retornamos valores padrão e permitimos criar/atualizar via PUT.

module.exports = async function handler(req, res) {
  if (applyCors(req, res)) return;
  try {
    const supabase = getSupabaseClient();
    if (req.method === 'GET') {
      const { data } = await supabase.from('profiles').select('*').limit(1);
      const profile = (data && data[0]) || null;
      return res.json(profile || { full_name: null, photo_url: null, email: null, twilio_phone_number: process.env.TWILIO_PROXY_ADDRESS || null });
    }
    if (req.method === 'PUT') {
      const payload = await parseBody(req);
      const { data } = await supabase.from('profiles').select('*').limit(1);
      if (data && data[0]) {
        const { data: upd } = await supabase
          .from('profiles')
          .update({
            full_name: payload.full_name || null,
            photo_url: payload.photo_url || null,
            twilio_phone_number: payload.twilio_phone_number || null,
          })
          .eq('id', data[0].id)
          .select('*')
          .single();
        return res.json(upd);
      }
      const { data: ins } = await supabase
        .from('profiles')
        .insert({
          full_name: payload.full_name || null,
          photo_url: payload.photo_url || null,
          twilio_phone_number: payload.twilio_phone_number || null,
        })
        .select('*')
        .single();
      return res.json(ins);
    }
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('users endpoint error', err);
    return res.status(500).json({ error: 'Internal' });
  }
}


