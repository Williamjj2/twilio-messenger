const axios = require('axios');
const { parseBody } = require('./_utils/parseBody');
const { verifyTwilioRequest } = require('./_utils/twilioVerify');

// Função para encontrar ou criar um contato
async function findOrCreateContact(apiConfig, fromNumber) {
  const { apiUrl, apiKey } = apiConfig;

  const searchUrl = `${apiUrl}/Contact?phone=eq.${fromNumber}`;
  const searchResponse = await axios.get(searchUrl, { headers: { api_key: apiKey } });
  if (searchResponse.data && searchResponse.data.length > 0) {
    return searchResponse.data[0];
  }

  const createUrl = `${apiUrl}/Contact`;
  const newContactData = { name: fromNumber, phone: fromNumber };
  const createResponse = await axios.post(createUrl, newContactData, {
    headers: { api_key: apiKey, 'Content-Type': 'application/json' },
  });
  return createResponse.data[0];
}

// Função para encontrar ou criar uma conversa
async function findOrCreateConversation(apiConfig, contactId) {
  const { apiUrl, apiKey } = apiConfig;

  const searchUrl = `${apiUrl}/Conversation?contact_id=eq.${contactId}`;
  const searchResponse = await axios.get(searchUrl, { headers: { api_key: apiKey } });
  if (searchResponse.data && searchResponse.data.length > 0) {
    return searchResponse.data[0];
  }

  const createUrl = `${apiUrl}/Conversation`;
  const newConversationData = {
    contact_id: contactId,
    last_message: 'Nova conversa iniciada',
    last_message_time: new Date().toISOString(),
  };
  const createResponse = await axios.post(createUrl, newConversationData, {
    headers: { api_key: apiKey, 'Content-Type': 'application/json' },
  });
  return createResponse.data[0];
}

// Webhook principal (mensagens recebidas do Twilio)
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const payload = await parseBody(req);
    req._parsedBody = payload; // usado pela validação de assinatura

    const isValid = await verifyTwilioRequest(req);
    if (!isValid) return res.status(403).send('Invalid signature');

    const { From, Body, To } = payload;
    // Twilio envia MediaUrlN quando há mídia (começando em 0)
    const mediaUrl0 = payload.MediaUrl0 || null;

    const apiConfig = {
      apiUrl: `https://app.base44.com/api/apps/${process.env.BASE44_APP_ID}/entities`,
      apiKey: process.env.BASE44_API_KEY,
    };

    const contact = await findOrCreateContact(apiConfig, From);
    const conversation = await findOrCreateConversation(apiConfig, contact.id);

    const messageData = {
      conversation_id: conversation.id,
      sender_phone: From,
      receiver_phone: To,
      content: Body || '',
      message_type: mediaUrl0 ? 'image' : 'text',
      media_url: mediaUrl0,
      is_outgoing: false,
      status: 'delivered',
      twilio_sid: payload.MessageSid,
    };

    await axios.post(`${apiConfig.apiUrl}/Message`, messageData, {
      headers: { api_key: apiConfig.apiKey, 'Content-Type': 'application/json' },
    });

    await axios.patch(
      `${apiConfig.apiUrl}/Conversation?id=eq.${conversation.id}`,
      {
        last_message: Body || 'Mídia recebida',
        last_message_time: new Date().toISOString(),
        unread_count: (conversation.unread_count || 0) + 1,
      },
      {
        headers: {
          api_key: apiConfig.apiKey,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
      }
    );

    // Resposta mínima exigida pelo Twilio
    return res.status(200).send('<Response/>');
  } catch (error) {
    console.error('Erro no webhook do Twilio:', error?.response?.data || error.message || error);
    return res.status(500).send('Erro interno do servidor');
  }
};