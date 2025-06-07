const express = require('express');
const app = express();
const WebSocket = require('ws');

// Configura parsing de JSON para requisições POST
app.use(express.json());

// Serve arquivos estáticos da pasta public
app.use(express.static('public'));

// Armazena mensagens em memória
let mensagens = [];

// Rota GET para retornar o histórico de mensagens
app.get('/api/mensagens', (req, res) => {
  res.json(mensagens);
});

// Rota POST para salvar mensagens
app.post('/api/mensagens', (req, res) => {
  const { conteudo, usuario } = req.body;
  if (!conteudo || !usuario) {
    return res.status(400).send('Mensagem e usuário são obrigatórios');
  }
  const mensagem = { conteudo, usuario, timestamp: new Date().toISOString() };
  mensagens.push(mensagem);
  // Envia a mensagem para todos os clientes WebSocket
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ tipo: 'mensagem', ...mensagem }));
    }
  });
  res.send('Mensagem recebida');
});

// Configura o servidor WebSocket na porta 8081
const wss = new WebSocket.Server({ Server }, () => {
  console.log('Servidor WebSocket rodando');
});
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ tipo: 'bem-vindo', mensagem: 'Bem-vindo ao chat!' }));
  ws.on('error', (error) => {
    console.error('Erro no WebSocket:', error);
  });
});

// Inicia o servidor na porta definida ou 3000
app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor HTTP rodando na porta', process.env.PORT || 3000);
});