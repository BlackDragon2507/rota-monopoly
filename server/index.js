const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

// Configuração do Socket.IO com suporte a CORS (para aceitar conexões do GitHub Pages)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Armazena o estado das salas ativas
const salas = {};

io.on('connection', (socket) => {
  console.log('Um jogador se conectou:', socket.id);

  // 1. Entrar ou criar uma sala
  socket.on('entrar_sala', ({ codigoSala, nomeJogador, cor }) => {
    socket.join(codigoSala);

    if (!salas[codigoSala]) {
      salas[codigoSala] = {
        jogadores: [],
        estadoJogo: null
      };
    }

    const jogadorExistente = salas[codigoSala].jogadores.find(j => j.id === socket.id);
    if (!jogadorExistente) {
      salas[codigoSala].jogadores.push({
        id: socket.id,
        nome: nomeJogador || `Jogador ${salas[codigoSala].jogadores.length + 1}`,
        cor: cor || '#3b82f6',
        dinheiro: 150000,
        posicao: 0,
        falido: false
      });
    }

    // Notifica todos na sala sobre a atualização da lista de jogadores
    io.to(codigoSala).emit('atualizar_sala', {
      jogadores: salas[codigoSala].jogadores,
      estadoJogo: salas[codigoSala].estadoJogo
    });
  });

  // 2. Sincronizar jogadas em tempo real (dados, posições, compras, vento, etc.)
  socket.on('realizar_jogada', ({ codigoSala, estadoJogo }) => {
    if (salas[codigoSala]) {
      salas[codigoSala].estadoJogo = estadoJogo;
      // Envia a jogada para todos os OUTROS jogadores da mesma sala
      socket.to(codigoSala).emit('receber_jogada', estadoJogo);
    }
  });

  // 3. Tratar desconexão do jogador
  socket.on('disconnect', () => {
    console.log('Jogador desconectado:', socket.id);
    for (const codigoSala in salas) {
      const idx = salas[codigoSala].jogadores.findIndex(j => j.id === socket.id);
      if (idx !== -1) {
        salas[codigoSala].jogadores.splice(idx, 1);
        io.to(codigoSala).emit('atualizar_sala', {
          jogadores: salas[codigoSala].jogadores,
          estadoJogo: salas[codigoSala].estadoJogo
        });
        
        // Se a sala ficar vazia, remove da memória
        if (salas[codigoSala].jogadores.length === 0) {
          delete salas[codigoSala];
        }
        break;
      }
    }
  });
});

// Rota padrão para checar se o servidor está online
app.get('/', (req, res) => {
  res.send('Servidor do Rota Monopoly está rodando perfeitamente!');
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
