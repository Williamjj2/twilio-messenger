// Placeholder para compatibilidade com a UI fornecida.
// Em produção, substitua por chamadas reais ou remova, pois o envio é feito pelo backend via /api/send-message.
export async function InvokeLLM() {
  return { status: 'error', error_message: 'InvokeLLM não é usado no webapp. O envio é tratado pelo backend.' }
}

export async function UploadFile({ file }) {
  // Para simplificar, tentar usar URL.createObjectURL não serve para envio Twilio. Use um host público.
  return { file_url: '' }
}


