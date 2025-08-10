/*
 Configura o Webhook do Twilio Conversations Service para apontar ao endpoint de produção.

 Uso:
   node scripts/configureTwilioWebhook.js "https://SEU-DOMINIO.vercel.app"
*/

const twilio = require('twilio');

async function main() {
  const baseUrl = process.argv[2] || process.env.WEBHOOK_BASE_URL;
  if (!baseUrl) {
    console.error('Base URL não informada. Passe como argumento ou defina WEBHOOK_BASE_URL.');
    process.exit(1);
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    console.error('TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN ausentes no ambiente.');
    process.exit(1);
  }

  const client = twilio(accountSid, authToken);
  const webhookUrl = `${baseUrl.replace(/\/$/, '')}/api/twilio-conversations-webhook`;

  try {
    // Usa Service existente (primeiro) ou cria um novo
    const services = await client.conversations.v1.services.list({ limit: 1 });
    let service = services[0];
    if (!service) {
      service = await client.conversations.v1.services.create({ friendlyName: 'Messages App Service' });
      console.log('Service criado:', service.sid);
    } else {
      console.log('Service existente:', service.sid);
    }

    // Configura webhooks do Service
    // Atualiza a configuração do Service (service-scoped webhooks)
    const cfg = await client.conversations.v1
      .services(service.sid)
      .configuration()
      .update({
        defaultChatServiceRoleSid: undefined,
        defaultConversationCreatorRoleSid: undefined,
        defaultConversationRoleSid: undefined,
        preWebhookUrl: null,
        postWebhookUrl: webhookUrl,
        webhookMethod: 'POST',
        webhookFilters: ['onMessageAdded', 'onParticipantAdded', 'onDeliveryUpdated']
      });

    console.log('Webhook configurado (service configuration):', service.sid, '→', webhookUrl);

    // Exibe o Service SID para configurar no ambiente
    console.log('TWILIO_CONVERSATIONS_SERVICE_SID=', service.sid);
  } catch (e) {
    console.error('Falha ao configurar webhook:', e.message || e);
    process.exit(1);
  }
}

main();


