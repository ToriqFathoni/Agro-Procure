import { Client, LocalAuth } from 'whatsapp-web.js';

if (!(global as any)._whatsappClient) {
  (global as any)._whatsappClient = null;
  (global as any)._whatsappStatus = 'DISCONNECTED';
  (global as any)._whatsappQrData = null;
}

export function initializeClient() {
  if ((global as any)._whatsappClient) {
    return;
  }

  (global as any)._whatsappStatus = 'INITIALIZING';

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'agro_procurement_session' }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  client.on('qr', (qr) => {
    (global as any)._whatsappQrData = qr;
    (global as any)._whatsappStatus = 'QR_READY';
  });

  client.on('ready', () => {
    (global as any)._whatsappQrData = null;
    (global as any)._whatsappStatus = 'AUTHENTICATED';
  });

  client.on('authenticated', () => {
    (global as any)._whatsappQrData = null;
    (global as any)._whatsappStatus = 'AUTHENTICATED';
  });

  client.on('auth_failure', () => {
    (global as any)._whatsappStatus = 'DISCONNECTED';
    (global as any)._whatsappQrData = null;
  });

  client.initialize().catch(() => {
    (global as any)._whatsappStatus = 'DISCONNECTED';
  });

  (global as any)._whatsappClient = client;
}

export function getClient() {
  return (global as any)._whatsappClient;
}
