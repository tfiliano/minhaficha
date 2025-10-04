import * as brevo from "@getbrevo/brevo";

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!
);

const emailStyles = `
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
  .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
  .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
  .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  .info-box { background: white; border-left: 4px solid #3b82f6; padding: 15px; margin: 15px 0; border-radius: 4px; }
  .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; border-radius: 4px; }
  code { background: #e5e7eb; padding: 8px; display: inline-block; margin-top: 8px; border-radius: 4px; word-break: break-all; }
`;

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
      <style>${emailStyles}</style>
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

export async function sendPasswordResetEmail(
  toEmail: string,
  toName: string,
  resetLink: string
) {
  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.subject = "Recuperação de Senha - Minha Ficha";
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
      <style>${emailStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Recuperação de Senha</h1>
        </div>
        <div class="content">
          <p>Olá <strong>${toName}</strong>,</p>

          <p>Recebemos uma solicitação para redefinir a senha da sua conta no Minha Ficha.</p>

          <div class="info-box">
            <p><strong>Se você não fez esta solicitação</strong>, ignore este email e sua senha permanecerá inalterada.</p>
          </div>

          <p>Para criar uma nova senha, clique no botão abaixo:</p>

          <div style="text-align: center;">
            <a href="${resetLink}" class="button">Redefinir Senha</a>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            Ou copie e cole este link no seu navegador:<br>
            <code>${resetLink}</code>
          </p>

          <div class="warning-box">
            <p style="margin: 0;">
              ⚠️ <strong>Este link expira em 1 hora</strong> por motivos de segurança.
            </p>
          </div>

          <p style="margin-top: 20px; font-size: 13px; color: #666;">
            Se você continuar tendo problemas, entre em contato com o suporte.
          </p>
        </div>
        <div class="footer">
          <p>Este é um email automático do sistema Minha Ficha. Não responda esta mensagem.</p>
          <p>Por questões de segurança, nunca compartilhe este link com outras pessoas.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Email de recuperação enviado:", data);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error("Erro ao enviar email de recuperação:", error);
    throw error;
  }
}

export async function sendMagicLinkEmail(
  toEmail: string,
  toName: string,
  magicLink: string
) {
  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.subject = "Link de Acesso - Minha Ficha";
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
      <style>${emailStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ Link Mágico de Acesso</h1>
        </div>
        <div class="content">
          <p>Olá <strong>${toName}</strong>,</p>

          <p>Aqui está seu link mágico para acessar o Minha Ficha. Basta clicar no botão abaixo para fazer login automaticamente!</p>

          <div class="info-box">
            <p><strong>Acesso sem senha</strong></p>
            <p>Você não precisa digitar sua senha. Clique no link e será autenticado automaticamente.</p>
          </div>

          <div style="text-align: center;">
            <a href="${magicLink}" class="button">Acessar Minha Ficha</a>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            Ou copie e cole este link no seu navegador:<br>
            <code>${magicLink}</code>
          </p>

          <div class="warning-box">
            <p style="margin: 0;">
              ⚠️ <strong>Este link expira em 1 hora</strong> e só pode ser usado uma vez.
            </p>
          </div>

          <p style="margin-top: 20px; font-size: 13px; color: #666;">
            Se você não solicitou este link, pode ignorar este email com segurança.
          </p>
        </div>
        <div class="footer">
          <p>Este é um email automático do sistema Minha Ficha. Não responda esta mensagem.</p>
          <p>Por questões de segurança, nunca compartilhe este link com outras pessoas.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Magic link enviado:", data);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error("Erro ao enviar magic link:", error);
    throw error;
  }
}
