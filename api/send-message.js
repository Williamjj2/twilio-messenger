const { getSupabaseClient } = require('./_utils/supabaseClient');
const { getTwilioClient } = require('./_utils/twilioClient');
const { parseBody } = require('./_utils/parseBody');
const { applyCors } = require('./_utils/cors');
const axios = require('axios');
const path = require('path');

module.exports = async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { to, body, mediaUrls } = await parseBody(req);
    const fromNumber = process.env.TWILIO_MESSAGING_FROM || process.env.TWILIO_PHONE_NUMBER;
    const statusCallback = process.env.STATUS_CALLBACK_URL; // público (Vercel) apontando para api/twilio-status-callback

    if (!fromNumber) return res.status(400).json({ error: 'TWILIO_MESSAGING_FROM/TWILIO_PHONE_NUMBER não configurado' });
    if (!to) return res.status(400).json({ error: 'Campo to é obrigatório' });

    const supabase = getSupabaseClient();
    const tw = getTwilioClient();

    // Conversas da Twilio (Conversations)
    const serviceSid = process.env.TWILIO_CONVERSATIONS_SERVICE_SID; // IS... (opcional, usa Service padrão se ausente)
    const proxyAddress = process.env.TWILIO_PROXY_ADDRESS || process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_MESSAGING_FROM;
    if (!proxyAddress) return res.status(400).json({ error: 'TWILIO_PROXY_ADDRESS/TWILIO_PHONE_NUMBER não configurado' });

    // Garante contato e conversa
    const phone = to;
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    let contact = existingContact;
    if (!contact) {
      const { data: newContact, error: insertContactError } = await supabase
        .from('contacts')
        .insert({ name: phone, phone })
        .select('*')
        .single();
      if (insertContactError) throw insertContactError;
      contact = newContact;
    }

    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('contact_id', contact.id)
      .maybeSingle();

    let conversation = existingConversation;
    if (!conversation) {
      const { data: newConversation, error: convErr } = await supabase
        .from('conversations')
        .insert({ contact_id: contact.id, updated_at: new Date().toISOString() })
        .select('*')
        .single();
      if (convErr) throw convErr;
      conversation = newConversation;
    }

    // Garante Conversation no Twilio e participante SMS
    if (!conversation.twilio_conversation_sid) {
      let ch;
      if (serviceSid) {
        ch = await tw.conversations.v1
          .services(serviceSid)
          .conversations
          .create({ friendlyName: `contact:${phone}` });
      } else {
        ch = await tw.conversations.v1
          .conversations
          .create({ friendlyName: `contact:${phone}` });
      }

      const chSid = ch.sid;

      // Adiciona participante SMS (cliente)
      await tw.conversations.v1
        .conversations(chSid)
        .participants
        .create({
          'messagingBinding.address': phone,
          'messagingBinding.proxyAddress': proxyAddress,
        });

      // Salva SIDs
      const { data: updatedConv } = await supabase
        .from('conversations')
        .update({ twilio_conversation_sid: chSid, updated_at: new Date().toISOString() })
        .eq('id', conversation.id)
        .select('*')
        .single();
      conversation = updatedConv || conversation;
    }

    const chSid = conversation.twilio_conversation_sid;
    if (!chSid) return res.status(500).json({ error: 'Falha ao criar/obter Conversation no Twilio' });

    const hasMedia = Array.isArray(mediaUrls) && mediaUrls.length > 0;
    const messageSids = [];

    if (hasMedia) {
      // Envia primeira mídia (com body, se presente)
      const firstUrl = mediaUrls[0];
      const headOrGet = await axios.get(firstUrl, { responseType: 'stream' });
      const ct = headOrGet.headers['content-type'] || 'application/octet-stream';
      const fileName = path.basename(new URL(firstUrl).pathname) || 'file';

      const createdFirst = await tw.conversations.v1
        .conversations(chSid)
        .messages
        .create({
          author: proxyAddress,
          body: body || undefined,
          media: {
            contentType: ct,
            filename: fileName,
            media: headOrGet.data,
          },
        });
      messageSids.push(createdFirst.sid);

      // Demais mídias, cada uma em uma mensagem separada
      for (let i = 1; i < mediaUrls.length; i += 1) {
        const url = mediaUrls[i];
        const resp = await axios.get(url, { responseType: 'stream' });
        const ctype = resp.headers['content-type'] || 'application/octet-stream';
        const fname = path.basename(new URL(url).pathname) || `file-${i}`;

        const createdMedia = await tw.conversations.v1
          .conversations(chSid)
          .messages
          .create({
            author: proxyAddress,
            media: {
              contentType: ctype,
              filename: fname,
              media: resp.data,
            },
          });
        messageSids.push(createdMedia.sid);
      }
    } else {
      // Envia texto puro
      const created = await tw.conversations.v1
        .conversations(chSid)
        .messages
        .create({ author: proxyAddress, body: body || '' });
      messageSids.push(created.sid);
    }

    // Persiste mensagem conforme schema (sender, receiver, type, body, content_url)
    // Persiste mensagens criadas
    let lastInserted = null;
    for (let idx = 0; idx < messageSids.length; idx += 1) {
      const sid = messageSids[idx];
      const isMedia = hasMedia && (idx < mediaUrls.length);
      const originalUrl = isMedia ? mediaUrls[idx] : null;
      const type = isMedia
        ? (originalUrl && /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(originalUrl) ? 'image' : 'media')
        : 'text';

      const payload = {
        conversation_id: conversation.id,
        sender: fromNumber,
        receiver: to,
        type,
        body: !isMedia ? (body || null) : null,
        content_url: originalUrl,
        status: 'queued',
        twilio_sid: sid,
      };
      const { data: inserted, error: insertErr } = await supabase
        .from('messages')
        .insert(payload)
        .select('*')
        .single();
      if (insertErr) throw insertErr;
      lastInserted = inserted;
    }

    // Atualiza conversa: mantém referência para a última mensagem e atualiza o timestamp
    await supabase
      .from('conversations')
      .update({ last_message_id: lastInserted.id, updated_at: new Date().toISOString() })
      .eq('id', conversation.id);

    return res.status(200).json({ ok: true, sids: messageSids, status: 'queued', conversationSid: chSid });
  } catch (err) {
    console.error('send-message error', err);
    return res.status(500).json({ error: 'Internal error', details: String(err.message || err) });
  }
}


