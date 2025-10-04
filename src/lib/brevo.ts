import * as brevo from "@getbrevo/brevo";

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!
);

export async function sendInviteEmail(
  toEmail: string,
  toName: string,
  inviterName: string,
  inviteLink: string,
  lojaNome: string
) {
  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.subject = `Convite para acessar ${lojaNome} - Minha Ficha`;
  sendSmtpEmail.to = [{ email: toEmail, name: toName || toEmail }];
  sendSmtpEmail.sender = {
    email: "noreply@minhaficha.app",
    name: "Minha Ficha",
  };
  sendSmtpEmail.htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .info-box { background: white; border-left: 4px solid #3b82f6; padding: 15px; margin: 15px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 Você foi convidado!</h1>
        </div>
        <div class="content">
          <p><strong>${inviterName}</strong> convidou você para acessar a loja <strong>${lojaNome}</strong> no sistema Minha Ficha.</p>

          <div class="info-box">
            <p><strong>O que é o Minha Ficha?</strong></p>
            <p>Sistema completo de gestão de fichas técnicas e etiquetas para a indústria alimentícia.</p>
          </div>

          <p>Para aceitar o convite e começar a usar o sistema, clique no botão abaixo:</p>

          <div style="text-align: center;">
            <a href="${inviteLink}" class="button">Aceitar Convite</a>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            Ou copie e cole este link no seu navegador:<br>
            <code style="background: #e5e7eb; padding: 8px; display: inline-block; margin-top: 8px; border-radius: 4px; word-break: break-all;">${inviteLink}</code>
          </p>

          <p style="margin-top: 20px; font-size: 13px; color: #666;">
            ⏰ Este convite expira em 7 dias.
          </p>
        </div>
        <div class="footer">
          <p>Este é um email automático do sistema Minha Ficha. Não responda esta mensagem.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Email enviado com sucesso:", data);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    throw error;
  }
}
