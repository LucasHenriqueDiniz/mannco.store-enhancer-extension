// Certifique-se de que a porta 8081 está configurada corretamente
export const webSocketServerPort = process.env.CLI_CEB_HMR_PORT
  ? Number(process.env.CLI_CEB_HMR_PORT)
  : 8081;
export const webSocketServerHost = process.env.CLI_CEB_HMR_HOST || 'localhost';

// Exponha o URL completo para depuração
export const webSocketServerUrl = `ws://${webSocketServerHost}:${webSocketServerPort}`;

// Adicione log para depuração
if (process.env.CLI_CEB_DEV) {
  console.log(`[HMR] Server configured at ${webSocketServerUrl}`);
}

// Configuração para o HTML da página de teste
export const hmrTestPageHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>HMR WebSocket Test</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f7f7f7; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #333; }
    .status { margin: 20px 0; padding: 15px; border-radius: 4px; }
    .success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    .error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    .info { background-color: #cce5ff; color: #004085; border: 1px solid #b8daff; }
    pre { background: #f8f9fa; padding: 10px; border-radius: 4px; overflow: auto; }
    button { background-color: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
    button:hover { background-color: #0069d9; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Mannco.store Enhancer - HMR Status</h1>
    
    <div class="info status">
      <p>Esta é uma página de diagnóstico para o Hot Module Replacement (HMR) da extensão.</p>
      <p>O servidor WebSocket está rodando na porta <strong>${webSocketServerPort}</strong>.</p>
    </div>
    
    <div id="status" class="status">Testando conexão WebSocket...</div>
    
    <h2>Informações de depuração:</h2>
    <pre id="debug"></pre>
    
    <button id="test">Testar conexão novamente</button>
  </div>

  <script>
    const statusEl = document.getElementById('status');
    const debugEl = document.getElementById('debug');
    
    function updateDebug(msg) {
      debugEl.textContent += msg + '\\n';
    }
    
    function testConnection() {
      statusEl.textContent = 'Conectando ao WebSocket...';
      statusEl.className = 'status';
      
      try {
        updateDebug('Tentando conectar a: ${webSocketServerUrl}');
        const ws = new WebSocket('${webSocketServerUrl}');
        
        ws.onopen = function() {
          statusEl.textContent = 'Conectado com sucesso! O servidor HMR está funcionando corretamente.';
          statusEl.className = 'status success';
          updateDebug('Conexão estabelecida com sucesso');
          
          ws.send(JSON.stringify({type: 'ping'}));
        };
        
        ws.onmessage = function(event) {
          updateDebug('Mensagem recebida: ' + event.data);
        };
        
        ws.onerror = function(error) {
          statusEl.textContent = 'Erro ao conectar ao servidor WebSocket';
          statusEl.className = 'status error';
          updateDebug('Erro na conexão WebSocket');
          console.error(error);
        };
        
        ws.onclose = function() {
          updateDebug('Conexão WebSocket fechada');
        };
      } catch (error) {
        statusEl.textContent = 'Falha ao criar conexão WebSocket: ' + error.message;
        statusEl.className = 'status error';
        updateDebug('Exceção: ' + error.message);
        console.error(error);
      }
    }
    
    document.getElementById('test').addEventListener('click', function() {
      debugEl.textContent = '';
      testConnection();
    });
    
    // Executar teste ao carregar
    testConnection();
  </script>
</body>
</html>
`;
