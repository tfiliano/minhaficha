/**
 * Configurações de contato para a landing page
 *
 * IMPORTANTE: Substitua o número de WhatsApp pelo número real da empresa
 * Formato: Código do país (55) + DDD + Número (sem espaços, traços ou parênteses)
 * Exemplo: 5511999999999
 */

export const CONTACT_CONFIG = {
  // Número do WhatsApp: +55 11 98101-2031
  whatsapp: "5511981012031",

  // Mensagens padrão para diferentes CTAs
  messages: {
    hero: "Olá! Gostaria de conhecer o Minha Ficha e saber mais sobre o sistema.",
    cta: "Olá! Gostaria de uma demonstração do Minha Ficha.",
    navbar: "Olá! Gostaria de conhecer o Minha Ficha.",
  },
};

/**
 * Gera o link do WhatsApp com a mensagem
 */
export function getWhatsAppLink(message: keyof typeof CONTACT_CONFIG.messages) {
  const encodedMessage = encodeURIComponent(CONTACT_CONFIG.messages[message]);
  return `https://wa.me/${CONTACT_CONFIG.whatsapp}?text=${encodedMessage}`;
}
