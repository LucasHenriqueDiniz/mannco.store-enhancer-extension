import { WebSocketServer } from 'ws';
import { hmrTestPageHtml, webSocketServerPort } from './config';
import { createServer } from 'http';

export function setupHMRServer() {
  // Criar servidor HTTP para páginas de diagnóstico
  const httpServer = createServer((req, res) => {
    // Responder com uma página HTML se acessar via navegador
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(hmrTestPageHtml);
  });

  // Criar WebSocketServer usando o servidor HTTP
  const wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', ws => {
    console.log('[HMR] Client connected');

    // Responder a pings do cliente
    ws.on('message', message => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', time: new Date().toISOString() }));
        }
      } catch (e) {
        console.error('[HMR] Error parsing message:', e);
      }
    });

    ws.on('close', () => {
      console.log('[HMR] Client disconnected');
    });
  });

  // Iniciar o servidor HTTP na porta configurada
  httpServer.listen(webSocketServerPort, () => {
    console.log(`[HMR] Server is listening on port ${webSocketServerPort}`);
    console.log(`[HMR] Test page available at http://localhost:${webSocketServerPort}`);
  });

  return wss;
}
