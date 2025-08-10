module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const html = `<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Twilio Conversations - Teste</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; margin: 24px; line-height: 1.4 }
    label { display:block; margin-top:12px; font-weight:600 }
    input, textarea { width:100%; padding:8px; border:1px solid #ccc; border-radius:8px }
    button { margin-top:16px; padding:10px 16px; border:0; background:#0d6efd; color:#fff; border-radius:8px; cursor:pointer }
    button:disabled { opacity:.6; cursor:not-allowed }
    .row { display:grid; grid-template-columns: 1fr 1fr; gap:12px }
    pre { background:#0b1021; color:#e5e7eb; padding:12px; border-radius:8px; overflow:auto }
    small { color:#555 }
  </style>
</head>
<body>
  <h2>Twilio Conversations - Envio de Mensagens</h2>
  <div class="row">
    <div>
      <label for="to">Para (E.164)</label>
      <input id="to" placeholder="+55XXXXXXXXXX" />
    </div>
    <div>
      <label for="media">Media URLs (separadas por vírgula)</label>
      <input id="media" placeholder="https://site/img1.jpg, https://site/doc.pdf" />
      <small>Arquivos devem estar acessíveis publicamente</small>
    </div>
  </div>
  <label for="body">Mensagem (texto)</label>
  <textarea id="body" rows="4" placeholder="Digite sua mensagem..."></textarea>
  <button id="send">Enviar</button>

  <h3>Resposta</h3>
  <pre id="out">Aguardando...</pre>

  <script>
    const btn = document.getElementById('send');
    const out = document.getElementById('out');
    btn.addEventListener('click', async () => {
      btn.disabled = true; out.textContent = 'Enviando...';
      const to = document.getElementById('to').value.trim();
      const body = document.getElementById('body').value;
      const mediaRaw = document.getElementById('media').value.trim();
      const mediaUrls = mediaRaw ? mediaRaw.split(',').map(s => s.trim()).filter(Boolean) : undefined;
      try {
        const resp = await fetch('/api/send-message', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to, body, mediaUrls })
        });
        const json = await resp.json();
        out.textContent = JSON.stringify(json, null, 2);
      } catch (e) {
        out.textContent = 'Erro: ' + (e && e.message || e);
      } finally {
        btn.disabled = false;
      }
    });
  </script>
  <p><small>Este painel chama o endpoint <code>/api/send-message</code> deste projeto.</small></p>
</body>
</html>`;
  res.status(200).send(html);
}


