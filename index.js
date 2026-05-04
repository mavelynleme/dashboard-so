const express = require("express");
const cors = require("cors");
const os = require("os");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Dashboard do Sistema</title>
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: Arial, Helvetica, sans-serif;
        }

        body {
          min-height: 100vh;
          background: #0f172a;
          color: #e2e8f0;
          padding: 28px;
        }

        header {
          margin-bottom: 26px;
          border-bottom: 1px solid #334155;
          padding-bottom: 18px;
        }

        h1 {
          color: #ec4899;
          font-size: 34px;
          margin-bottom: 8px;
        }

        .subtitulo {
          color: #94a3b8;
          line-height: 1.5;
        }

        .dashboard {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
          gap: 18px;
        }

        .card {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 14px;
          padding: 20px;
          box-shadow: 0 12px 26px rgba(0, 0, 0, 0.28);
        }

        .card h2 {
          color: #ec4899;
          font-size: 18px;
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 0;
        }

        .item {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          border-bottom: 1px solid #334155;
          padding: 10px 0;
          line-height: 1.4;
        }

        .item:last-child {
          border-bottom: 0;
        }

        .label {
          color: #cbd5e1;
          font-weight: bold;
        }

        .valor {
          color: #e2e8f0;
          font-weight: bold;
          text-align: right;
        }

        .destaque {
          color: #22c55e;
        }

        .numero-grande {
          color: #22c55e;
          font-size: 34px;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .descricao {
          color: #94a3b8;
          margin-bottom: 12px;
          line-height: 1.5;
        }

        .barra {
          width: 100%;
          height: 16px;
          background: #334155;
          border-radius: 999px;
          overflow: hidden;
          margin-top: 10px;
        }

        .preenchimento {
          width: 0%;
          height: 100%;
          background: #22c55e;
          border-radius: 999px;
          transition: width 0.4s ease, background 0.4s ease;
        }

        .percentual {
          color: #e2e8f0;
          font-size: 26px;
          font-weight: bold;
        }

        .erro {
          display: none;
          background: rgba(239, 68, 68, 0.12);
          color: #fecaca;
          border: 1px solid #ef4444;
          border-radius: 10px;
          padding: 14px;
          margin-bottom: 18px;
        }

        @media (max-width: 640px) {
          body {
            padding: 18px;
          }

          h1 {
            font-size: 28px;
          }

          .item {
            display: block;
          }

          .valor {
            display: block;
            text-align: left;
            margin-top: 4px;
          }
        }
      </style>
    </head>
    <body>
      <header>
        <h1>Dashboard do Sistema</h1>
        <p class="subtitulo">Painel dark de monitoramento com Node.js, Express e JavaScript puro.</p>
        <p class="subtitulo">Ultima atualizacao: <span id="ultimaAtualizacao">Carregando...</span></p>
      </header>

      <div id="erro" class="erro">Nao foi possivel carregar os dados da API.</div>

      <main class="dashboard">
        <section class="card">
          <h2>Sistema</h2>
          <p class="item"><span class="label">Hostname</span><span id="hostname" class="valor">Carregando...</span></p>
          <p class="item"><span class="label">Sistema operacional</span><span id="plataforma" class="valor">Carregando...</span></p>
          <p class="item"><span class="label">Arquitetura</span><span id="arquitetura" class="valor">Carregando...</span></p>
          <p class="item"><span class="label">CPUs</span><span id="cpus" class="valor destaque">Carregando...</span></p>
        </section>

        <section class="card">
          <h2>Usuario</h2>
          <p class="descricao">Nome do usuario do sistema operacional.</p>
          <div id="usuario" class="numero-grande">Carregando...</div>
        </section>

        <section class="card">
          <h2>Arquivos</h2>
          <p class="descricao">Quantidade de arquivos e pastas no diretorio do projeto.</p>
          <div id="arquivos" class="numero-grande">Carregando...</div>
        </section>

        <section class="card">
          <h2>Tempo</h2>
          <p class="descricao">Uptime do sistema operacional.</p>
          <div id="uptime" class="numero-grande">Carregando...</div>
        </section>

        <section class="card">
          <h2>Memoria</h2>
          <p class="item"><span class="label">Memoria total</span><span id="memoriaTotal" class="valor">Carregando...</span></p>
          <p class="item"><span class="label">Memoria livre</span><span id="memoriaLivre" class="valor">Carregando...</span></p>
          <p class="item"><span class="label">Percentual de uso</span><span id="memoriaPercentual" class="percentual">0%</span></p>
          <div class="barra">
            <div id="barraMemoria" class="preenchimento"></div>
          </div>
        </section>

        <section class="card">
          <h2>CPU</h2>
          <p class="descricao">Uso de CPU simulado para representar monitoramento em tempo real.</p>
          <div id="cpuPercentual" class="percentual">0%</div>
          <div class="barra">
            <div id="barraCpu" class="preenchimento"></div>
          </div>
        </section>

        <section class="card">
          <h2>Aplicacao</h2>
          <p class="item"><span class="label">Porta</span><span id="porta" class="valor">Carregando...</span></p>
          <p class="item"><span class="label">Ambiente</span><span id="ambiente" class="valor destaque">Carregando...</span></p>
          <p class="item"><span class="label">Versao do Node.js</span><span id="versaoNode" class="valor">Carregando...</span></p>
        </section>
      </main>

      <script>
        function formatarBytes(bytes) {
          const gigabytes = bytes / 1024 / 1024 / 1024;
          return gigabytes.toFixed(2) + " GB";
        }

        function formatarUptime(segundos) {
          const horas = Math.floor(segundos / 3600);
          const minutos = Math.floor((segundos % 3600) / 60);
          const segundosRestantes = Math.floor(segundos % 60);
          return horas + "h " + minutos + "min " + segundosRestantes + "s";
        }

        function corDaBarra(percentual) {
          if (percentual > 80) {
            return "#ef4444";
          }

          if (percentual >= 50) {
            return "#facc15";
          }

          return "#22c55e";
        }

        function atualizarBarra(idTexto, idBarra, percentual) {
          const texto = document.getElementById(idTexto);
          const barra = document.getElementById(idBarra);

          texto.textContent = percentual + "%";
          texto.style.color = corDaBarra(percentual);
          barra.style.width = percentual + "%";
          barra.style.background = corDaBarra(percentual);
        }

        async function carregarDashboard() {
          try {
            document.getElementById("erro").style.display = "none";

            const respostaSistema = await fetch("/sistema");
            const respostaAmbiente = await fetch("/ambiente");
            const respostaDesempenho = await fetch("/desempenho");

            const sistema = await respostaSistema.json();
            const ambiente = await respostaAmbiente.json();
            const desempenho = await respostaDesempenho.json();

            document.getElementById("hostname").textContent = sistema.hostname;
            document.getElementById("plataforma").textContent = sistema.plataforma;
            document.getElementById("arquitetura").textContent = sistema.arquitetura;
            document.getElementById("cpus").textContent = sistema.cpus + " nucleos";
            document.getElementById("usuario").textContent = sistema.usuario;
            document.getElementById("arquivos").textContent = sistema.arquivos;
            document.getElementById("uptime").textContent = formatarUptime(sistema.uptime);
            document.getElementById("memoriaTotal").textContent = formatarBytes(sistema.memoriaTotal);
            document.getElementById("memoriaLivre").textContent = formatarBytes(sistema.memoriaLivre);

            document.getElementById("porta").textContent = ambiente.porta;
            document.getElementById("ambiente").textContent = ambiente.ambiente;
            document.getElementById("versaoNode").textContent = ambiente.versaoNode;

            atualizarBarra("cpuPercentual", "barraCpu", desempenho.cpu);
            atualizarBarra("memoriaPercentual", "barraMemoria", desempenho.memoria);

            document.getElementById("ultimaAtualizacao").textContent = new Date().toLocaleTimeString("pt-BR");
          } catch (erro) {
            document.getElementById("erro").style.display = "block";
          }
        }

        carregarDashboard();
        setInterval(carregarDashboard, 5000);
      </script>
    </body>
    </html>
  `);
});

app.get("/sistema", (req, res) => {
  fs.readdir(process.cwd(), (erro, arquivos) => {
    if (erro) {
      return res.status(500).json({
        erro: "Nao foi possivel ler o diretorio do projeto.",
      });
    }

    res.json({
      hostname: os.hostname(),
      plataforma: os.platform(),
      arquitetura: os.arch(),
      cpus: os.cpus().length,
      memoriaTotal: os.totalmem(),
      memoriaLivre: os.freemem(),
      uptime: os.uptime(),
      usuario: os.userInfo().username,
      arquivos: arquivos.length,
    });
  });
});

app.get("/ambiente", (req, res) => {
  const estaNaRender = Boolean(process.env.RENDER);
  const estaNaRailway = Boolean(process.env.RAILWAY_ENVIRONMENT);

  let ambiente = "Local";

  if (estaNaRender) {
    ambiente = "Nuvem (Render)";
  } else if (estaNaRailway) {
    ambiente = "Nuvem (Railway)";
  }

  res.json({
    ambiente,
    porta: PORT,
    versaoNode: process.version,
  });
});

app.get("/desempenho", (req, res) => {
  const cpu = Math.floor(Math.random() * 101);
  const memoriaUsada = os.totalmem() - os.freemem();
  const memoria = Math.round((memoriaUsada / os.totalmem()) * 100);

  res.json({
    cpu,
    memoria,
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
