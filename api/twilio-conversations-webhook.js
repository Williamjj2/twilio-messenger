const { getSupabaseClient } = require('./_utils/supabaseClient');
const { parseBody } = require('./_utils/parseBody');
const { verifyTwilioRequest } = require('./_utils/twilioVerify');

// Webhook de Conversations (pre/post action). Configure no Console em Service-level Webhooks.
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

    const eventType = payload.EventType;
    const chSid = payload.ConversationSid; // CH...
    const participantSid = payload.ParticipantSid; // MB...
    const messageSid = payload.MessageSid; // IM...

    // Vincula Conversation CH ao nosso registro quando ainda não estiver salvo
    if (eventType === 'onConversationAdded' && chSid) {
      // Nada a fazer agora — criamos via API e salvamos quando criamos
    }

    if (eventType === 'onParticipantAdded') {
      // Se participante SMS foi adicionado, podemos armazenar o ParticipantSid
      const mbAddress = payload['MessagingBinding.Address'] || null; // telefone do cliente
      if (chSid && participantSid) {
        let { data: conv } = await supabase
          .from('conversations')
          .select('*')
          .eq('twilio_conversation_sid', chSid)
          .maybeSingle();
        // Cria contact/conversation se não existir
        if (!conv && mbAddress) {
          const { data: existingContact } = await supabase
            .from('contacts')
            .select('*')
            .eq('phone', mbAddress)
            .maybeSingle();
          let contact = existingContact;
          if (!contact) {
            const { data: newContact } = await supabase
              .from('contacts')
              .insert({ name: mbAddress, phone: mbAddress })
              .select('*')
              .single();
            contact = newContact;
          }
          const { data: newConv } = await supabase
            .from('conversations')
            .insert({ contact_id: contact.id, twilio_conversation_sid: chSid, updated_at: new Date().toISOString() })
            .select('*')
            .single();
          conv = newConv;
        }

        if (conv && !conv.customer_participant_sid && mbAddress) {
          await supabase
            .from('conversations')
            .update({ customer_participant_sid: participantSid, updated_at: new Date().toISOString() })
            .eq('id', conv.id);
        }
      }
    }

    if (eventType === 'onMessageAdded') {
      const body = payload.Body || null;
      const author = payload.Author || null; // pode ser o número do usuário (SMS) ou identity
      const proxy = payload['MessagingBinding.ProxyAddress'] || null; // nosso número Twilio
      const numMedia = Number(payload.NumMedia || 0);

      // Descobre conversa por CH SID
      let { data: conv } = await supabase
        .from('conversations')
        .select('*')
        .eq('twilio_conversation_sid', chSid)
        .maybeSingle();

      // Se não existir, cria contato/conversation com base no Address (telefone do cliente)
      if (!conv) {
        const mbAddress = payload['MessagingBinding.Address'] || null;
        if (mbAddress) {
          const { data: existingContact } = await supabase
            .from('contacts')
            .select('*')
            .eq('phone', mbAddress)
            .maybeSingle();
          let contact = existingContact;
          if (!contact) {
            const { data: newContact } = await supabase
              .from('contacts')
              .insert({ name: mbAddress, phone: mbAddress })
              .select('*')
              .single();
            contact = newContact;
          }
          const { data: newConv } = await supabase
            .from('conversations')
            .insert({ contact_id: contact.id, twilio_conversation_sid: chSid, updated_at: new Date().toISOString() })
            .select('*')
            .single();
          conv = newConv;
        }
      }

      if (conv) {
        // Persistir mensagem recebida (incoming)
        // Se houver mídias, Twilio envia campos Media.ContentTypeN / Media.FileNameN / Media.SidN?
        const insertedIds = [];
        if (numMedia > 0) {
          for (let i = 0; i < numMedia; i += 1) {
            const fileUrl = payload[`Media.Url${i}`] || null;
            const ctype = payload[`Media.ContentType${i}`] || null;
            const type = ctype && ctype.startsWith('image/') ? 'image' : 'media';
            const msgRow = {
              conversation_id: conv.id,
              sender: author || 'unknown',
              receiver: proxy || 'unknown',
              type,
              body: i === 0 ? (body || null) : null,
              content_url: fileUrl,
              status: 'delivered',
              twilio_sid: messageSid,
            };
            const { data: inserted } = await supabase
              .from('messages')
              .insert(msgRow)
              .select('*')
              .single();
            if (inserted) insertedIds.push(inserted.id);
          }
        } else {
          const msgRow = {
            conversation_id: conv.id,
            sender: author || 'unknown',
            receiver: proxy || 'unknown',
            type: 'text',
            body,
            content_url: null,
            status: 'delivered',
            twilio_sid: messageSid,
          };
          const { data: inserted } = await supabase
            .from('messages')
            .insert(msgRow)
            .select('*')
            .single();
          if (inserted) insertedIds.push(inserted.id);
        }

        if (insertedIds.length > 0) {
          await supabase
            .from('conversations')
            .update({ last_message_id: insertedIds[insertedIds.length - 1], updated_at: new Date().toISOString() })
            .eq('id', conv.id);
        }
      }
    }

    if (eventType === 'onDeliveryUpdated' && messageSid) {
      // Atualiza status baseado no webhook de delivery
      const deliveryStatus = payload.Status; // read, delivered, sent, failed, undelivered
      await supabase
        .from('messages')
        .update({ status: deliveryStatus || null })
        .eq('twilio_sid', messageSid);
    }

    return res.status(200).send('OK');
  } catch (err) {
    console.error('conversations-webhook error', err);
    return res.status(500).send('Internal');
  }
};


